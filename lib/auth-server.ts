import "server-only";

export async function setSessionCookie(_idToken: string): Promise<string> {
  return "noop";
}

export async function clearSessionCookie(): Promise<void> {}

export interface AuthUser {
  uid: string;
  name: string | null;
  email: string | null;
  picture: string | null;
}

const HARDCODED_USER: AuthUser = {
  uid: "default-user",
  name: "User",
  email: "user@example.com",
  picture: null,
};

export async function getCurrentUser(): Promise<AuthUser> {
  return HARDCODED_USER;
}
