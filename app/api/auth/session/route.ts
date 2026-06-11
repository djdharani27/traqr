import { cookies } from "next/headers";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth-server";

export async function POST(req: Request) {
  console.log("[AUTH] POST /api/auth/session called");
  try {
    const { idToken } = await req.json();
    console.log("[AUTH] idToken received, calling setSessionCookie...");
    await setSessionCookie(idToken);
    console.log("[AUTH] setSessionCookie succeeded");
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[AUTH] POST /api/auth/session FAILED:", message);
    return Response.json({ ok: false, error: message }, { status: 401 });
  }
}

export async function DELETE() {
  console.log("[AUTH] DELETE /api/auth/session called");
  await clearSessionCookie();
  console.log("[AUTH] Session cookie cleared");
  return Response.json({ ok: true });
}
