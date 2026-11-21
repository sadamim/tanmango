import { applicationDefault, cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { FieldValue, getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

/** True when enough Firebase configuration is present to talk to Firestore. */
export function firebaseConfigured() {
  const e = process.env;
  return Boolean(e.FIREBASE_SERVICE_ACCOUNT_JSON || (e.FIREBASE_PROJECT_ID && e.FIREBASE_CLIENT_EMAIL && e.FIREBASE_PRIVATE_KEY) || e.GOOGLE_APPLICATION_CREDENTIALS || e.FIRESTORE_EMULATOR_HOST);
}

function parseServiceAccount(raw: string) {
  const txt = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
  const j = JSON.parse(txt);
  return { projectId: j.project_id as string, clientEmail: j.client_email as string, privateKey: String(j.private_key).replace(/\\n/g, "\n") };
}

function credentialOptions() {
  const e = process.env;
  if (e.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const sa = parseServiceAccount(e.FIREBASE_SERVICE_ACCOUNT_JSON);
    return { credential: cert(sa), projectId: sa.projectId };
  }
  if (e.FIREBASE_PROJECT_ID && e.FIREBASE_CLIENT_EMAIL && e.FIREBASE_PRIVATE_KEY) {
    // .env files often store the key with literal "\n" and wrapping quotes
    const privateKey = e.FIREBASE_PRIVATE_KEY.replace(/^"|"$/g, "").replace(/\\n/g, "\n");
    return { credential: cert({ projectId: e.FIREBASE_PROJECT_ID, clientEmail: e.FIREBASE_CLIENT_EMAIL, privateKey }), projectId: e.FIREBASE_PROJECT_ID };
  }
  if (e.GOOGLE_APPLICATION_CREDENTIALS) return { credential: applicationDefault(), projectId: e.FIREBASE_PROJECT_ID };
  // Emulator: no credentials needed, only a project id.
  return { projectId: e.FIREBASE_PROJECT_ID || "tagmango-local" };
}

export function firebaseApp(): App {
  if (getApps().length) return getApps()[0]!;
  return initializeApp({ ...credentialOptions(), storageBucket: process.env.FIREBASE_STORAGE_BUCKET });
}

const g = globalThis as { __tmFirestore?: Firestore };

/** One Firestore instance per process (survives Next.js hot reloads, which would otherwise re-run settings()). */
export function firestore(): Firestore {
  if (!g.__tmFirestore) {
    const db = getFirestore(firebaseApp());
    db.settings({ ignoreUndefinedProperties: true });
    g.__tmFirestore = db;
  }
  return g.__tmFirestore;
}

export const fieldValue = FieldValue;

export function storageBucket() {
  const name = process.env.FIREBASE_STORAGE_BUCKET;
  if (!name) throw new Error("FIREBASE_STORAGE_BUCKET is not set — add it to .env.local (Firebase console → Storage → bucket name, e.g. my-project.firebasestorage.app).");
  return getStorage(firebaseApp()).bucket(name);
}
