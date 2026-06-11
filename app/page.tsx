import { getCurrentUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { TodayDashboard } from "@/components/TodayDashboard";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <TodayDashboard userId={user.uid} />;
}
