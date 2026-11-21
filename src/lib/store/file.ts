import { promises as fs } from "fs";
import path from "path";
import { checkKeys, matches, type Doc, type Filter, type FindOpts, type Op, type Store, type Tx } from "./types";

type Data = Record<string, Doc[]>;

export const dataDir = () => path.join(process.cwd(), process.env.DATA_DIR || "data");
const FILE = () => path.join(dataDir(), "db.json");

/** Older versions kept { users, sessions, otps, rows: { <collection>: [...] } }. Flatten that into { <collection>: [...] }. */
function normalise(raw: unknown): Data {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const out: Data = {};
  const take = (name: string, v: unknown) => {
    if (Array.isArray(v)) out[name] = v.filter((d) => d && typeof d === "object" && typeof (d as Doc).id === "string") as Doc[];
  };
  for (const [k, v] of Object.entries(r)) {
    if (k === "rows" && v && typeof v === "object") for (const [c, rows] of Object.entries(v as object)) take(c, rows);
    else take(k, v); // legacy sessions/otps had no ids, so they are filtered out here and users simply log in again
  }
  return out;
}

async function load(): Promise<Data> {
  try {
    return normalise(JSON.parse(await fs.readFile(FILE(), "utf8")));
  } catch {
    return {};
  }
}

async function save(data: Data) {
  await fs.mkdir(dataDir(), { recursive: true });
  const tmp = FILE() + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, FILE());
}

const clone = <T>(v: T): T => (v === undefined ? v : (JSON.parse(JSON.stringify(v)) as T));
const strip = (o: Record<string, unknown>) => JSON.parse(JSON.stringify(o)) as Record<string, unknown>; // drops undefined like Firestore's ignoreUndefinedProperties

function apply(data: Data, ops: Op[]) {
  for (const op of ops) {
    const list = (data[op.coll] ||= []);
    const i = list.findIndex((d) => d.id === op.id);
    if (op.type === "set") {
      const doc = { ...strip(op.data), id: op.id } as Doc;
      if (i >= 0) list[i] = doc;
      else list.push(doc);
    } else if (op.type === "update") {
      checkKeys(op.patch);
      if (i < 0) throw new Error(`${op.coll}/${op.id} not found`);
      const next: Record<string, unknown> = { ...list[i] };
      for (const [k, v] of Object.entries(op.patch)) {
        if (v === undefined) delete next[k];
        else next[k] = clone(v);
      }
      list[i] = next as Doc;
    } else if (i >= 0) list.splice(i, 1);
  }
}

let queue: Promise<unknown> = Promise.resolve();
function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn);
  queue = run.catch(() => undefined);
  return run;
}

function find(data: Data, coll: string, filters: Filter[] = [], opts: FindOpts = {}) {
  const out = (data[coll] || []).filter((d) => matches(d, filters));
  return clone(opts.limit ? out.slice(0, opts.limit) : out);
}

export function createFileStore(): Store {
  const reader = {
    get: async (coll: string, id: string) => clone((await load())[coll]?.find((d) => d.id === id) || null),
    find: async (coll: string, filters?: Filter[], opts?: FindOpts) => find(await load(), coll, filters, opts),
  };

  return {
    kind: "file",
    ...reader,
    count: async (coll, filters) => find(await load(), coll, filters).length,

    tx: <T>(fn: (t: Tx) => Promise<T>) =>
      enqueue(async () => {
        const data = await load();
        const ops: Op[] = [];
        const t: Tx = {
          get: async (c, id) => clone(data[c]?.find((d) => d.id === id) || null),
          find: async (c, f, o) => find(data, c, f, o),
          set: (coll, id, d) => void ops.push({ type: "set", coll, id, data: d }),
          update: (coll, id, patch) => {
            checkKeys(patch);
            ops.push({ type: "update", coll, id, patch });
          },
          delete: (coll, id) => void ops.push({ type: "delete", coll, id }),
        };
        const out = await fn(t);
        if (ops.length) {
          apply(data, ops);
          await save(data);
        }
        return out;
      }),

    write: (ops) =>
      enqueue(async () => {
        if (!ops.length) return;
        const data = await load();
        apply(data, ops);
        await save(data);
      }),

    deleteWhere: (coll, filters) =>
      enqueue(async () => {
        const data = await load();
        const before = (data[coll] || []).length;
        data[coll] = (data[coll] || []).filter((d) => !matches(d, filters));
        const n = before - data[coll].length;
        if (n) await save(data);
        return n;
      }),
  };
}
