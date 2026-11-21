/**
 * Runs the same behavioural contract against both storage drivers:
 *   - the local file driver (real, in a temp folder)
 *   - the Firestore driver on top of an in-memory fake that enforces Firestore's rules
 * Usage: npm run test:store
 */
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import assert from "node:assert/strict";
import { createFileStore } from "../src/lib/store/file";
import { createFirestoreStore } from "../src/lib/store/firestore";
import type { Store } from "../src/lib/store/types";
import { FakeFirestore, fakeFieldValue } from "./fakeFirestore";

let failed = 0;
async function t(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log("PASS", name);
  } catch (e) {
    failed++;
    console.log("FAIL", name, "\n     ", (e as Error).message);
  }
}

async function contract(label: string, make: () => { store: Store; fake?: FakeFirestore }) {
  console.log(`\n== ${label}`);
  const { store, fake } = make();
  const U = "users";

  await t("set + get round-trips and stamps the id", async () => {
    await store.write([{ type: "set", coll: U, id: "a", data: { name: "Asha", n: 1, nested: { x: [1, 2] } } }]);
    assert.deepEqual(await store.get(U, "a"), { id: "a", name: "Asha", n: 1, nested: { x: [1, 2] } });
    assert.equal(await store.get(U, "missing"), null);
  });

  await t("undefined values are dropped on set (no crash)", async () => {
    await store.write([{ type: "set", coll: U, id: "u", data: { a: 1, b: undefined, c: { d: undefined, e: 2 } } }]);
    assert.deepEqual(await store.get(U, "u"), { id: "u", a: 1, c: { e: 2 } });
  });

  await t("find with equality filters, limit and count", async () => {
    await store.write([1, 2, 3, 4].map((i) => ({ type: "set" as const, coll: "orders", id: `o${i}`, data: { userId: i % 2 ? "x" : "y", status: i < 3 ? "ok" : "no" } })));
    assert.equal((await store.find("orders", [["userId", "x"]])).length, 2);
    assert.equal((await store.find("orders", [["userId", "x"], ["status", "ok"]])).length, 1);
    assert.equal((await store.find("orders", [], { limit: 3 })).length, 3);
    assert.equal(await store.count("orders", [["userId", "y"]]), 2);
    assert.equal(await store.count("orders"), 4);
    assert.equal((await store.find("nothing-here")).length, 0);
  });

  await t("== null only matches explicit nulls, never missing fields", async () => {
    await store.write([{ type: "set", coll: "n", id: "1", data: { v: null } }, { type: "set", coll: "n", id: "2", data: {} }]);
    assert.deepEqual((await store.find("n", [["v", null]])).map((d) => d.id), ["1"]);
  });

  await t("update merges, undefined deletes a field, missing doc throws", async () => {
    await store.write([{ type: "update", coll: U, id: "a", patch: { n: 2, extra: "e" } }]);
    await store.write([{ type: "update", coll: U, id: "a", patch: { extra: undefined } }]);
    assert.deepEqual(await store.get(U, "a"), { id: "a", name: "Asha", n: 2, nested: { x: [1, 2] } });
    await assert.rejects(store.write([{ type: "update", coll: U, id: "ghost", patch: { n: 1 } }]));
  });

  await t("dotted / reserved field names are rejected in updates", async () => {
    await assert.rejects(store.write([{ type: "update", coll: U, id: "a", patch: { "a.b": 1 } }]));
    await assert.rejects(store.tx(async (tx) => tx.update(U, "a", { __x__: 1 })));
  });

  await t("tx: reads, buffered writes, returns a value", async () => {
    const out = await store.tx(async (tx) => {
      const a = await tx.get(U, "a");
      const list = await tx.find("orders", [["userId", "x"]]);
      tx.update(U, "a", { n: (a!.n as number) + list.length });
      tx.set("log", "l1", { by: "a" });
      return "done";
    });
    assert.equal(out, "done");
    assert.equal((await store.get(U, "a"))!.n, 4);
    assert.ok(await store.get("log", "l1"));
  });

  await t("tx: writes are not visible to later reads in the same tx", async () => {
    await store.tx(async (tx) => {
      tx.set("iso", "k", { v: 1 });
      assert.equal(await tx.get("iso", "k"), null);
    });
    assert.ok(await store.get("iso", "k"));
  });

  await t("tx: an error discards every buffered write", async () => {
    await assert.rejects(store.tx(async (tx) => { tx.set("never", "1", { a: 1 }); tx.update(U, "a", { n: 999 }); throw new Error("boom"); }), /boom/);
    assert.equal(await store.get("never", "1"), null);
    assert.equal((await store.get(U, "a"))!.n, 4);
  });

  await t("tx: delete works and mixed set/update/delete commit together", async () => {
    await store.tx(async (tx) => { tx.delete("log", "l1"); tx.set("log", "l2", { z: 1 }); tx.update(U, "u", { a: 5 }); });
    assert.equal(await store.get("log", "l1"), null);
    assert.ok(await store.get("log", "l2"));
    assert.equal((await store.get(U, "u"))!.a, 5);
  });

  await t("concurrent read-modify-write transactions don't lose updates", async () => {
    await store.write([{ type: "set", coll: "ctr", id: "c", data: { n: 0 } }]);
    await Promise.all(Array.from({ length: 12 }, () => store.tx(async (tx) => { const c = await tx.get("ctr", "c"); tx.update("ctr", "c", { n: (c!.n as number) + 1 }); })));
    assert.equal((await store.get("ctr", "c"))!.n, 12);
  });

  await t("write() handles more than one batch (900 docs)", async () => {
    await store.write(Array.from({ length: 900 }, (_, i) => ({ type: "set" as const, coll: "bulk", id: `d${i}`, data: { g: i % 3 } })));
    assert.equal(await store.count("bulk"), 900);
  });

  await t("deleteWhere removes only matching docs (across chunks)", async () => {
    const n = await store.deleteWhere("bulk", [["g", 0]]);
    assert.equal(n, 300);
    assert.equal(await store.count("bulk"), 600);
    assert.equal(await store.deleteWhere("bulk", [["g", 99]]), 0);
  });

  if (fake) {
    await t("firestore: callback is retried on contention and only the final attempt commits", async () => {
      await store.write([{ type: "set", coll: "retry", id: "r", data: { n: 0 } }]);
      fake.failNextTxCommits = 2;
      fake.attempts = 0;
      let runs = 0;
      await store.tx(async (tx) => { runs++; const r = await tx.get("retry", "r"); tx.update("retry", "r", { n: (r!.n as number) + 1 }); });
      assert.equal(runs, 3);
      assert.equal((await store.get("retry", "r"))!.n, 1);
    });
  }
}

async function main() {
  const dir = mkdtempSync(path.join(tmpdir(), "tm-store-"));
  process.env.DATA_DIR = path.relative(process.cwd(), dir);
  await contract("file driver", () => ({ store: createFileStore() }));
  const fake = new FakeFirestore();
  await contract("firestore driver (strict in-memory fake)", () => ({ store: createFirestoreStore(fake as never, fakeFieldValue), fake }));
  rmSync(dir, { recursive: true, force: true });
  console.log(failed ? `\n${failed} failed` : "\nALL PASSED");
  process.exit(failed ? 1 : 0);
}
main();
