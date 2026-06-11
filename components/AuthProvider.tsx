"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Auth } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

let _auth: Auth | null = null;
let _initialized = false;

async function getOrInitAuth(): Promise<Auth> {
  if (_auth) return _auth;

  const { getAuth } = await import("firebase/auth");
  const { getApp, getApps, initializeApp } = await import("firebase/app");

  let app;
  if (getApps().length > 0) {
    app = getApp();
  } else {
    app = initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    });
  }

  _auth = getAuth(app);
  return _auth;
}

export function AuthProvider({ children }: { children?: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    (async () => {
      const { onAuthStateChanged } = await import("firebase/auth");
      const auth = await getOrInitAuth();
      _initialized = true;

      console.log("[AUTH] onAuthStateChanged listener registered");
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        console.log("[AUTH] onAuthStateChanged fired:", firebaseUser ? `uid=${firebaseUser.uid}` : "null");
        setUser(firebaseUser);
        setLoading(false);
      });
    })();

    return () => {
      console.log("[AUTH] useEffect cleanup: unsubscribing onAuthStateChanged");
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signIn = useCallback(async () => {
    console.log("[AUTH] signIn() called");
    const { signInWithPopup, GoogleAuthProvider } = await import("firebase/auth");
    const auth = await getOrInitAuth();

    let result;
    try {
      console.log("[AUTH] signInWithPopup starting...");
      result = await signInWithPopup(auth, new GoogleAuthProvider());
      console.log("[AUTH] signInWithPopup succeeded:", result.user.uid);
    } catch (err) {
      console.error("[AUTH] signInWithPopup FAILED:", err);
      throw err;
    }

    let idToken;
    try {
      idToken = await result.user.getIdToken();
      console.log("[AUTH] getIdToken succeeded");
    } catch (err) {
      console.error("[AUTH] getIdToken FAILED:", err);
      throw err;
    }

    console.log("[AUTH] POSTing idToken to /api/auth/session...");
    let response;
    try {
      response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      console.log("[AUTH] /api/auth/session response status:", response.status, "ok:", response.ok);
    } catch (err) {
      console.error("[AUTH] fetch to /api/auth/session FAILED (network error):", err);
      throw err;
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      console.error("[AUTH] /api/auth/session returned error:", response.status, body);
      throw new Error(`Session creation failed: HTTP ${response.status}`);
    }

    console.log("[AUTH] signIn() complete — session cookie set");
  }, []);

  const signOut = useCallback(async () => {
    console.log("[AUTH] signOut() called");
    const { signOut: fbSignOut } = await import("firebase/auth");
    const auth = await getOrInitAuth();
    await fbSignOut(auth);
    console.log("[AUTH] Firebase signOut complete");
    await fetch("/api/auth/session", { method: "DELETE" });
    console.log("[AUTH] Session cookie cleared, signOut complete");
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
