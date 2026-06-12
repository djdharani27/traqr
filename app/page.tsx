import { requireUser } from "@/lib/auth-server";
import { TodayDashboard } from "@/components/TodayDashboard";

export default async function HomePage() {
  const user = await requireUser();
  return <TodayDashboard userId={user.uid} />;
}
