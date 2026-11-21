/**
 * One-off: copy the local JSON database (data/db.json) and uploads (data/uploads) into Firebase.
 *   npm run migrate:firebase            # dry run (counts only)
 *   npm run migrate:firebase -- --go    # actually write
 * Reads .env.local for the FIREBASE_* variables. Safe to re-run: documents are overwritten by id.
 */
import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { createFileStore, dataDir } from "../src/lib/store/file";
import { createFirestoreStore } from "../src/lib/store/firestore";
import { fieldValue, firebaseConfigured, firestore, storageBucket } from "../src/lib/store/firebase";
import { ROW_COLLECTIONS } from "../src/lib/collections";
import type { Op } from "../src/lib/store/types";

const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

async function main() {
  const go = process.argv.includes("--go");
  if (!firebaseConfigured()) throw new Error("Firebase variables are missing. Fill FIREBASE_* in .env.local first.");
  const local = createFileStore();
  const remote = createFirestoreStore(firestore(), fieldValue);

  const ops: Op[] = [];
  const users = await local.find("users");
  for (const u of users) {
    const { id, ...data } = u;
    ops.push({ type: "set", coll: "users", id, data });
    ops.push({ type: "set", coll: "claims", id: sha(`email:${u.email}`), data: { userId: id, kind: "email" } });
    ops.push({ type: "set", coll: "claims", id: sha(`phone:${u.phone}`), data: { userId: id, kind: "phone" } });
  }
  for (const c of [...ROW_COLLECTIONS, "audit", "announcements"]) {
    for (const d of await local.find(c)) {
      const { id, ...data } = d;
      ops.push({ type: "set", coll: c, id, data });
    }
  }
  console.log(`${users.length} users, ${ops.length} documents ready to copy.`);

  const files: { userId: string; id: string; mime: string; file: string }[] = [];
  for (const r of await local.find("cloud")) {
    const nested = path.join(dataDir(), "uploads", String(r.userId), r.id);
    const flat = path.join(dataDir(), "uploads", r.id);
    for (const file of [nested, flat]) if (await fs.stat(file).then(() => true, () => false)) { files.push({ userId: String(r.userId), id: r.id, mime: String(r.mime || "application/octet-stream"), file }); break; }
  }
  console.log(`${files.length} uploaded files to copy.`);

  if (!go) return console.log("Dry run only. Re-run with  -- --go  to write to Firebase.");
  await remote.write(ops);
  if (files.length) {
    const bucket = storageBucket();
    for (const f of files) await bucket.file(`uploads/${f.userId}/${f.id}`).save(await fs.readFile(f.file), { contentType: f.mime });
  }
  console.log("Done. Users must log in again (sessions are not migrated).");
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
