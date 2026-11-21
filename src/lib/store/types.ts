/**
 * Storage contract used by the whole backend. Two drivers implement it:
 *  - "firestore": Firebase Firestore (production)
 *  - "file":      a local JSON file (zero-setup development)
 *
 * Rules every caller must follow so both drivers behave the same:
 *  - Only equality filters (no ordering) so Firestore never needs composite indexes. Sort in memory.
 *  - Inside tx(): all reads happen against the state when the transaction started (your own buffered
 *    writes are NOT visible), and the callback may run more than once on contention, so keep side
 *    effects (emails, file deletes) outside it.
 */
export type Doc = { id: string; [k: string]: unknown };
export type Filter = [field: string, value: unknown];
export type FindOpts = { limit?: number };

export interface Reader {
  get(coll: string, id: string): Promise<Doc | null>;
  find(coll: string, filters?: Filter[], opts?: FindOpts): Promise<Doc[]>;
}

export interface Tx extends Reader {
  /** Create or fully replace a document. */
  set(coll: string, id: string, data: Record<string, unknown>): void;
  /** Shallow-merge into an existing document (throws if it doesn't exist). `undefined` deletes a field. */
  update(coll: string, id: string, patch: Record<string, unknown>): void;
  delete(coll: string, id: string): void;
}

export type Op =
  | { type: "set"; coll: string; id: string; data: Record<string, unknown> }
  | { type: "update"; coll: string; id: string; patch: Record<string, unknown> }
  | { type: "delete"; coll: string; id: string };

export interface Store extends Reader {
  readonly kind: "file" | "firestore";
  tx<T>(fn: (t: Tx) => Promise<T>): Promise<T>;
  count(coll: string, filters?: Filter[]): Promise<number>;
  /** Non-transactional bulk write (chunked). Use for fan-out such as one notification per creator. */
  write(ops: Op[]): Promise<void>;
  /** Delete every document matching the filters; returns how many were removed. */
  deleteWhere(coll: string, filters: Filter[]): Promise<number>;
}

/** Strict equality like Firestore's ==: a missing field does NOT equal null. An undefined filter value is treated as null. */
export const matches = (d: Doc, filters: Filter[] = []) => filters.every(([f, v]) => d[f] === (v === undefined ? null : v));

export function checkKeys(patch: Record<string, unknown>) {
  for (const k of Object.keys(patch)) if (!k || k.includes(".") || k.startsWith("__")) throw new Error(`Invalid field name: ${k}`);
}
