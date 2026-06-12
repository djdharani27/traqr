import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";

let _initialized = false;

export function ensureAdminInitialized(): void {
  if (_initialized || getApps().length > 0) {
    _initialized = true;
    return;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    const normalizedKey = serviceAccountKey.replace(/\n/g, "");

    let parsed;
    try {
      parsed = JSON.parse(normalizedKey);
    } catch (e) {
      console.error("[AUTH] FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON. Ensure it is a single line with \\n escape sequences for the private key, not literal newlines.", e);
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON. The private key must use \\n escape sequences, not literal newlines.");
    }

    const isPlaceholder =
      parsed.private_key === "..." ||
      parsed.private_key_id === "..." ||
      parsed.client_email === "...";

    if (isPlaceholder) {
      console.error(
        "[AUTH] FIREBASE_SERVICE_ACCOUNT_KEY contains placeholder values (\"...\"). You must replace it with a real service account key from Firebase Console → Project Settings → Service accounts → Generate new private key."
      );
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_KEY still has placeholder values. Replace it with a real key from Firebase Console."
      );
    }

    console.log("[AUTH] Admin SDK initializing with FIREBASE_SERVICE_ACCOUNT_KEY for project:", parsed.project_id);
    initializeApp({
      credential: cert(parsed),
    });
    console.log("[AUTH] Admin SDK initialized successfully");
  } else {
    console.warn("[AUTH] Admin SDK initializing WITHOUT credentials (FIREBASE_SERVICE_ACCOUNT_KEY not set) — session cookie creation will fail unless ADC is configured");
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
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
