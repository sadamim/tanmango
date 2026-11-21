import type { Firestore, Query } from "firebase-admin/firestore";
import { checkKeys, type Doc, type Filter, type FindOpts, type Op, type Store, type Tx } from "./types";

type Sentinel = { delete(): unknown };

const stripUndefined = (o: Record<string, unknown>) => JSON.parse(JSON.stringify(o)) as Record<string, unknown>;
const toDoc = (id: string, data: Record<string, unknown> | undefined): Doc => ({ ...(data || {}), id });
const CHUNK = 400; // Firestore allows 500 writes per batch

/**
 * Firestore implementation of the Store contract. `db` and the FieldValue sentinel are injected so the
 * same code can be exercised against an in-memory fake in tests (see tests/store-contract.ts).
 */
export function createFirestoreStore(db: Firestore, FieldValue: Sentinel): Store {
  const query = (coll: string, filters: Filter[] = [], opts: FindOpts = {}) => {
    let q: Query = db.collection(coll);
    for (const [f, v] of filters) q = q.where(f, "==", v === undefined ? null : v);
    if (opts.limit) q = q.limit(opts.limit);
    return q;
  };

  const patchOf = (patch: Record<string, unknown>) => {
    checkKeys(patch);
    return Object.fromEntries(Object.entries(patch).map(([k, v]) => [k, v === undefined ? FieldValue.delete() : v]));
  };

  const commitOps = async (ops: Op[]) => {
    for (let i = 0; i < ops.length; i += CHUNK) {
      const b = db.batch();
      for (const op of ops.slice(i, i + CHUNK)) {
        const ref = db.collection(op.coll).doc(op.id);
        if (op.type === "set") b.set(ref, { ...stripUndefined(op.data), id: op.id });
        else if (op.type === "update") b.update(ref, patchOf(op.patch));
        else b.delete(ref);
      }
      await b.commit();
    }
  };

  return {
    kind: "firestore",

    get: async (coll, id) => {
      const s = await db.collection(coll).doc(id).get();
      return s.exists ? toDoc(s.id, s.data()) : null;
    },

    find: async (coll, filters, opts) => (await query(coll, filters, opts).get()).docs.map((d) => toDoc(d.id, d.data())),

    count: async (coll, filters) => (await query(coll, filters).count().get()).data().count,

    tx: <T>(fn: (t: Tx) => Promise<T>) =>
      db.runTransaction(
        async (ft) => {
          // Firestore needs every read before any write, so writes are buffered and applied after fn returns.
          const writes: Op[] = [];
          const t: Tx = {
            get: async (c, id) => {
              const s = await ft.get(db.collection(c).doc(id));
              return s.exists ? toDoc(s.id, s.data()) : null;
            },
            find: async (c, f, o) => (await ft.get(query(c, f, o))).docs.map((d) => toDoc(d.id, d.data())),
            set: (coll, id, data) => void writes.push({ type: "set", coll, id, data }),
            update: (coll, id, patch) => {
              checkKeys(patch);
              writes.push({ type: "update", coll, id, patch });
            },
            delete: (coll, id) => void writes.push({ type: "delete", coll, id }),
          };
          const out = await fn(t);
          for (const w of writes) {
            const ref = db.collection(w.coll).doc(w.id);
            if (w.type === "set") ft.set(ref, { ...stripUndefined(w.data), id: w.id });
            else if (w.type === "update") ft.update(ref, patchOf(w.patch));
            else ft.delete(ref);
          }
          return out;
        },
        { maxAttempts: 5 }
      ),

    write: commitOps,

    deleteWhere: async (coll, filters) => {
      let removed = 0;
      for (;;) {
        const snap = await query(coll, filters, { limit: CHUNK }).get();
        if (snap.empty) return removed;
        await commitOps(snap.docs.map((d) => ({ type: "delete" as const, coll, id: d.id })));
        removed += snap.size;
        if (snap.size < CHUNK) return removed;
      }
    },
  };
}
