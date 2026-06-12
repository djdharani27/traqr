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
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => {},
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

export function AuthProvider({ children }: { children?: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let cancelled = false;
    let sessionCreated = false;

    const timeout = setTimeout(() => {
      if (!cancelled) {
        console.warn("[AUTH] onAuthStateChanged timeout — forcing loading=false");
        setLoading(false);
      }
    }, 10_000);

    (async () => {
      try {
        const { onAuthStateChanged, getRedirectResult } = await import("firebase/auth");
        const auth = await getOrInitAuth();

        // Register onAuthStateChanged BEFORE getRedirectResult so we never miss
        // an auth state update (fixes race condition on redirect return).
        console.log("[AUTH] Registering onAuthStateChanged listener...");
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          console.log("[AUTH] onAuthStateChanged fired:", firebaseUser ? `uid=${firebaseUser.uid}` : "null");

          if (firebaseUser && !sessionCreated && !cancelled) {
            sessionCreated = true;
            try {
              const idToken = await firebaseUser.getIdToken();
              const response = await fetch("/api/auth/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
              });
              if (response.ok) {
                console.log("[AUTH] Session cookie set via onAuthStateChanged");
              } else {
                console.error("[AUTH] Session creation via onAuthStateChanged failed:", response.status);
                sessionCreated = false; // allow retry on next fire
              }
            } catch (err) {
              console.error("[AUTH] Session creation via onAuthStateChanged error:", err);
              sessionCreated = false;
            }
          }

          setUser(firebaseUser);
          setLoading(false);
          clearTimeout(timeout);
        });

        // Also try to get the redirect result if this was a redirect-based sign-in.
        // If getRedirectResult succeeds, sessionCreated prevents a duplicate call
        // from the onAuthStateChanged handler above.
        try {
          const redirectResult = await getRedirectResult(auth);
          if (redirectResult && !cancelled) {
            console.log("[AUTH] Redirect result obtained:", redirectResult.user.uid);
            if (!sessionCreated) {
              sessionCreated = true;
              const idToken = await redirectResult.user.getIdToken();
              const response = await fetch("/api/auth/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
              });
              if (response.ok) {
                console.log("[AUTH] Session cookie set after redirect");
              } else {
                console.error("[AUTH] Session creation after redirect failed:", response.status);
              }
            }
          }
        } catch (redirectErr) {
          console.error("[AUTH] getRedirectResult failed:", redirectErr);
        }
      } catch (err) {
        console.error("[AUTH] Firebase initialization FAILED:", err);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      console.log("[AUTH] useEffect cleanup: unsubscribing onAuthStateChanged");
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signIn = useCallback(async () => {
    console.log("[AUTH] signIn() called");
    setError(null);
    try {
      const { signInWithRedirect, GoogleAuthProvider } = await import("firebase/auth");
      const auth = await getOrInitAuth();
      console.log("[AUTH] signInWithRedirect starting...");
      await signInWithRedirect(auth, new GoogleAuthProvider());
    } catch (err) {
      const code = (err as { code?: string })?.code;
      const msg = code ?? (err instanceof Error ? err.message : String(err));
      console.error("[AUTH] signInWithRedirect FAILED:", msg);
      setError(msg);
      throw err;
    }
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
    <AuthContext.Provider value={{ user, loading, error, signIn, signOut, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}
