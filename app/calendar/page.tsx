import { requireUser } from "@/lib/auth-server";
import { getTests, getAllStudyDays, getAllTasks } from "@/lib/services";
import { CalendarView } from "@/components/CalendarView";

export default async function CalendarPage() {
  const user = await requireUser();
  const [tests, studyDays, tasks] = await Promise.all([
    getTests(user.uid),
    getAllStudyDays(user.uid),
    getAllTasks(user.uid),
  ]);

  return (
    <div className="max-w-3xl mx-auto">
      <CalendarView tests={tests} studyDays={studyDays} tasks={tasks} />
    </div>
  );
}
