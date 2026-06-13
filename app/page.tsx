import { requireUser } from "@/lib/auth-server";
import { TodayDashboard } from "@/components/TodayDashboard";

export default async function HomePage() {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">
          Session expired. Please log in again.
        </p>
      </div>
    );
  }
  try {
    return <TodayDashboard userId={user.uid} />;
  } catch (e) {
    console.error("[HomePage] Dashboard render error:", e);
    throw e;
  }
}
