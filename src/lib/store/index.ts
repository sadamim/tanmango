import { createFileStore } from "./file";
import { createFirestoreStore } from "./firestore";
import { fieldValue, firebaseConfigured, firestore } from "./firebase";
import type { Store } from "./types";

export * from "./types";

/** STORE_DRIVER=firestore | file | auto (default). Auto uses Firestore when Firebase credentials are present. */
export function storeKind(): "file" | "firestore" {
  const want = (process.env.STORE_DRIVER || "auto").toLowerCase();
  if (want === "file" || want === "firestore") return want;
  if (firebaseConfigured()) return "firestore";
  if (process.env.NODE_ENV === "production") {
    throw new Error("Firebase isn't configured. Set the FIREBASE_* variables (see .env.example), or STORE_DRIVER=file to knowingly use local files (data is lost on serverless hosts).");
  }
  return "file";
}

const g = globalThis as { __tmStore?: Store };

function getStore(): Store {
  if (!g.__tmStore) g.__tmStore = storeKind() === "firestore" ? createFirestoreStore(firestore(), fieldValue) : createFileStore();
  return g.__tmStore;
}

/**
 * Short-lived cache of "session → user", so a page that makes several API calls doesn't re-read the session and user from
 * the database every time (each Firestore read can cost 100–300 ms). It is emptied whenever anything writes to the
 * users or sessions collections, so changes made through this server show up at once. Other server instances may
 * lag by up to AUTH_TTL_MS (e.g. a suspension takes up to 15 seconds to bite there).
 */
const AUTH_TTL_MS = 15_000;
type AuthEntry = { at: number; user: unknown };
const ag = globalThis as { __tmAuth?: Map<string, AuthEntry> };
const authMap = () => (ag.__tmAuth ||= new Map());
export const authCache = {
  get(key: string) {
    const e = authMap().get(key);
    return e && Date.now() - e.at < AUTH_TTL_MS ? e : null;
  },
  set(key: string, user: unknown) {
    const m = authMap();
    if (m.size > 2000) m.clear();
    m.set(key, { at: Date.now(), user });
  },
  clear: () => authMap().clear(),
};
const AUTH_COLLS = new Set(["users", "sessions"]);

/** The database. Lazily created so importing this module never touches Firebase or the disk. */
export const store: Store = {
  get kind() {
    return getStore().kind;
  },
  get: (c, id) => getStore().get(c, id),
  find: (c, f, o) => getStore().find(c, f, o),
  count: (c, f) => getStore().count(c, f),
  tx: async (fn) => {
    let touched = false;
    const mark = (c: string) => {
      if (AUTH_COLLS.has(c)) touched = true;
    };
    try {
      return await getStore().tx((t) => fn({ ...t, set: (c, i, d) => (mark(c), t.set(c, i, d)), update: (c, i, p) => (mark(c), t.update(c, i, p)), delete: (c, i) => (mark(c), t.delete(c, i)) }));
    } finally {
      if (touched) authCache.clear();
    }
  },
  write: async (ops) => {
    const touched = ops.some((o) => AUTH_COLLS.has(o.coll));
    if (touched) authCache.clear();
    try {
      return await getStore().write(ops);
    } finally {
      if (touched) authCache.clear();
    }
  },
  deleteWhere: async (c, f) => {
    try {
      return await getStore().deleteWhere(c, f);
    } finally {
      if (AUTH_COLLS.has(c)) authCache.clear();
    }
  },
};
