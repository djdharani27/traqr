import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

let _initialized = false;

function loadServiceAccountKey() {
  const envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (envKey && envKey.length > 10) {
    try {
      return JSON.parse(envKey);
    } catch {
      try {
        return JSON.parse(envKey.replace(/\r?\n/g, "\\n"));
      } catch {
        // fall through
      }
    }
  }
  const envB64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_B64;
  if (envB64 && envB64.length > 10) {
    try {
      return JSON.parse(Buffer.from(envB64, "base64").toString("utf-8"));
    } catch {
      // fall through
    }
  }
  const filePath = resolve(process.cwd(), "service-account.json");
  if (existsSync(filePath)) {
    return JSON.parse(readFileSync(filePath, "utf-8"));
  }
  return null;
}

export function ensureAdminInitialized(): void {
  if (_initialized || getApps().length > 0) {
    _initialized = true;
    return;
  }

  const parsed = loadServiceAccountKey();
  if (parsed) {
    const isPlaceholder =
      parsed.private_key === "..." ||
      parsed.private_key_id === "..." ||
      parsed.client_email === "...";
    if (isPlaceholder) {
      console.warn("[ADMIN] Service account key has placeholder values");
      initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });
    } else {
      initializeApp({ credential: cert(parsed) });
      console.log("[ADMIN] Initialized with service account key");
    }
  } else {
    console.warn("[ADMIN] No service account key found, falling back to project ID");
    initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });
  }

  _initialized = true;
}

let _db: Firestore | null = null;

export function getAdminDb(): Firestore {
  ensureAdminInitialized();
  if (!_db) {
    _db = getFirestore();
  }
  return _db;
}
