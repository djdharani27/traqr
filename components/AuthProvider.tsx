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
  error: string | null;
  signIn: () => Promise<User>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => {
    throw new Error("AuthContext not initialized");
  },
  signOut: async () => {},
  clearError: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

let _auth: Auth | null = null;

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

async function createSession(firebaseUser: User): Promise<void> {
  const idToken = await firebaseUser.getIdToken();
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Session creation failed: ${response.status}`);
  }
}

export function AuthProvider({ children }: { children?: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let cancelled = false;
    let sessionAttempted = false;

    (async () => {
      try {
        const { onAuthStateChanged } = await import("firebase/auth");
        const auth = await getOrInitAuth();

        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          console.log("[AUTH] onAuthStateChanged:", firebaseUser ? `uid=${firebaseUser.uid}` : "null");

          if (firebaseUser && !sessionAttempted && !cancelled) {
            sessionAttempted = true;
            try {
              await createSession(firebaseUser);
              console.log("[AUTH] Session cookie set via onAuthStateChanged");
            } catch (err) {
              console.error("[AUTH] Session creation via onAuthStateChanged failed:", err);
              sessionAttempted = false;
            }
          }

          if (!cancelled) {
            setUser(firebaseUser);
            setLoading(false);
          }
        });
      } catch (err) {
        console.error("[AUTH] Firebase initialization FAILED:", err);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (): Promise<User> => {
    console.log("[AUTH] signIn() called");
    setError(null);
    try {
      const { signInWithPopup, GoogleAuthProvider } = await import("firebase/auth");
      const auth = await getOrInitAuth();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      console.log("[AUTH] signInWithPopup starting...");
      const result = await signInWithPopup(auth, provider);
      console.log("[AUTH] signInWithPopup succeeded:", result.user.uid);

      await createSession(result.user);
      console.log("[AUTH] Session cookie created after popup sign-in");

      setUser(result.user);
      return result.user;
    } catch (err) {
      const code = (err as { code?: string })?.code;
      const msg = code ?? (err instanceof Error ? err.message : String(err));
      console.error("[AUTH] signIn FAILED:", msg);
      setError(msg);
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    console.log("[AUTH] signOut() called");
    const { signOut: fbSignOut } = await import("firebase/auth");
    const auth = await getOrInitAuth();
    await fbSignOut(auth);
    await fetch("/api/auth/session", { method: "DELETE" });
    setUser(null);
    console.log("[AUTH] signOut complete");
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signOut, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}
