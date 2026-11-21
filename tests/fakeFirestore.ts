/**
 * A small in-memory stand-in for the parts of firebase-admin's Firestore that our driver uses.
 * It is deliberately strict about the same things real Firestore is strict about:
 *   - undefined field values are rejected (unless ignoreUndefinedProperties, which we don't enable here)
 *   - update() on a missing document fails
 *   - == null only matches fields that are explicitly null
 *   - batches and transactions are capped at 500 writes
 *   - FieldValue.delete() is only valid inside update()
 */
export const DELETE = Symbol("FieldValue.delete");
export const fakeFieldValue = { delete: () => DELETE as unknown };

type Data = Record<string, unknown>;
const hasUndefined = (v: unknown): boolean => v === undefined || (!!v && typeof v === "object" && Object.values(v as Data).some(hasUndefined));
const clone = <T,>(v: T): T => (v === undefined ? v : structuredClone(v));

export class FakeFirestore {
  colls = new Map<string, Map<string, Data>>();
  versions = new Map<string, number>(); // bumped on every write; used to detect transaction contention
  attempts = 0;
  failNextTxCommits = 0; // simulate contention: the callback is retried
  private c(name: string) {
    let m = this.colls.get(name);
    if (!m) this.colls.set(name, (m = new Map()));
    return m;
  }

  collection(name: string) {
    return new FakeQuery(this, name, []) as FakeQuery & { doc(id: string): FakeDoc };
  }

  batch() {
    const ops: (() => void)[] = [];
    const b = {
      set: (ref: FakeDoc, data: Data) => void ops.push(() => ref._set(data)),
      update: (ref: FakeDoc, patch: Data) => void ops.push(() => ref._update(patch)),
      delete: (ref: FakeDoc) => void ops.push(() => ref._delete()),
      commit: async () => {
        if (ops.length > 500) throw new Error("INVALID_ARGUMENT: maximum 500 writes allowed per request");
        ops.forEach((o) => o());
      },
    };
    return b;
  }

  async runTransaction<T>(fn: (t: Record<string, unknown>) => Promise<T>, opts?: { maxAttempts?: number }): Promise<T> {
    const max = opts?.maxAttempts ?? 5;
    for (let attempt = 1; ; attempt++) {
      this.attempts++;
      const writes: (() => void)[] = [];
      let wrote = false;
      const readVers = new Map<string, number>();
      const readQueries: { q: FakeQuery; ids: string }[] = [];
      const ver = (coll: string, id: string) => this.versions.get(`${coll}/${id}`) ?? 0;
      const t = {
        get: async (x: FakeDoc | FakeQuery) => {
          if (wrote) throw new Error("Firestore transactions require all reads to be executed before all writes.");
          if (x instanceof FakeDoc) {
            readVers.set(`${x.coll}/${x.id}`, ver(x.coll, x.id));
            return x.get();
          }
          const res = await x.get();
          for (const d of res.docs) readVers.set(`${x.collName}/${d.id}`, ver(x.collName, d.id));
          readQueries.push({ q: x, ids: res.docs.map((d) => d.id).join(",") });
          return res;
        },
        set: (ref: FakeDoc, d: Data) => { wrote = true; writes.push(() => ref._set(d)); return t; },
        update: (ref: FakeDoc, p: Data) => { wrote = true; writes.push(() => ref._update(p)); return t; },
        delete: (ref: FakeDoc) => { wrote = true; writes.push(() => ref._delete()); return t; },
      };
      const out = await fn(t as never);
      if (writes.length > 500) throw new Error("INVALID_ARGUMENT: too many writes");
      if (this.failNextTxCommits > 0 && attempt < max) { this.failNextTxCommits--; continue; }
      // Contention: anything we read changed (or a query's result set changed) since we read it -> retry (real Firestore waits on locks instead)
      const stale = [...readVers].some(([k, v]) => (this.versions.get(k) ?? 0) !== v) || readQueries.some((r) => r.q._ids() !== r.ids);
      if (stale) { if (attempt > 200) throw new Error("ABORTED: too much contention"); continue; }
      writes.forEach((w) => w());
      return out;
    }
  }

  // internals used by refs
  _docs(coll: string) { return this.c(coll); }
  _bump(coll: string, id: string) { this.versions.set(`${coll}/${id}`, (this.versions.get(`${coll}/${id}`) ?? 0) + 1); }
}

class FakeDoc {
  constructor(private db: FakeFirestore, public coll: string, public id: string) {}
  async get() {
    const d = this.db._docs(this.coll).get(this.id);
    return { id: this.id, exists: d !== undefined, data: () => clone(d) };
  }
  _set(data: Data) {
    if (hasUndefined(data)) throw new Error("Cannot use 'undefined' as a Firestore value");
    this.db._docs(this.coll).set(this.id, clone(data));
    this.db._bump(this.coll, this.id);
  }
  _update(patch: Data) {
    const cur = this.db._docs(this.coll).get(this.id);
    if (!cur) throw new Error(`NOT_FOUND: No document to update: ${this.coll}/${this.id}`);
    const next = { ...cur };
    for (const [k, v] of Object.entries(patch)) {
      if (k.includes(".")) throw new Error("dotted paths not supported by fake");
      if (v === DELETE) delete next[k];
      else if (hasUndefined(v)) throw new Error("Cannot use 'undefined' as a Firestore value");
      else next[k] = clone(v);
    }
    this.db._docs(this.coll).set(this.id, next);
    this.db._bump(this.coll, this.id);
  }
  _delete() { this.db._docs(this.coll).delete(this.id); this.db._bump(this.coll, this.id); }
}

class FakeQuery {
  constructor(private db: FakeFirestore, private coll: string, private filters: [string, unknown][], private lim?: number) {}
  get collName() { return this.coll; }
  doc(id: string) { return new FakeDoc(this.db, this.coll, id); }
  where(f: string, op: string, v: unknown) {
    if (op !== "==") throw new Error("only == supported");
    if (v === undefined) throw new Error("Cannot use 'undefined' as a Firestore value");
    return new FakeQuery(this.db, this.coll, [...this.filters, [f, v]], this.lim);
  }
  limit(n: number) { return new FakeQuery(this.db, this.coll, this.filters, n); }
  _ids() { return this.rows().map(([id]) => id).join(","); } // synchronous, used for commit-time validation
  private rows() {
    const out = [...this.db._docs(this.coll)].filter(([, d]) => this.filters.every(([f, v]) => d[f] === v));
    return this.lim ? out.slice(0, this.lim) : out;
  }
  async get() {
    const docs = this.rows().map(([id, d]) => ({ id, exists: true, data: () => clone(d) }));
    return { docs, size: docs.length, empty: docs.length === 0 };
  }
  count() { return { get: async () => ({ data: () => ({ count: this.rows().length }) }) }; }
}
