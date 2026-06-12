import { getTests, getAllStudyDays, getAllTasks } from "@/lib/services";
import { CalendarView } from "@/components/CalendarView";

export default async function CalendarPage() {
  const [tests, studyDays, tasks] = await Promise.all([
    getTests("default-user"),
    getAllStudyDays("default-user"),
    getAllTasks("default-user"),
  ]);

  return (
    <div className="max-w-3xl mx-auto">
      <CalendarView tests={tests} studyDays={studyDays} tasks={tasks} />
    </div>
  );
}
