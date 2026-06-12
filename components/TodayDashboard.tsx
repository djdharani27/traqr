import { getTests, getStudyDay, getTasksByTargetDate, getAllStudyDays, getOverdueTasks } from "@/lib/services";
import { format, parseISO } from "date-fns";
import {
  CalendarDays,
  ClipboardList,
  MessageSquare,
  CheckCircle2,
  Circle,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "./StatCard";
import { TestForm } from "./TestForm";
import { RemarkForm } from "./RemarkForm";
import { TaskForm } from "./TaskForm";
import { TaskCard } from "./TaskCard";
import { TestCard } from "./TestCard";
import { QuickEntryModal } from "./QuickEntryModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SearchBar } from "./SearchBar";

interface TodayDashboardProps {
  userId: string;
}

export async function TodayDashboard({ userId }: TodayDashboardProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  const [tests, studyDay, tasks, overdueTasks, allStudyDays, allTests] =
    await Promise.all([
      getTests(userId, today),
      getStudyDay(userId, today),
      getTasksByTargetDate(userId, today),
      getOverdueTasks(userId),
      getAllStudyDays(userId),
      getTests(userId),
    ]);

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {format(parseISO(today), "EEEE, MMMM d, yyyy")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your study dashboard for today
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SearchBar tests={allTests} studyDays={allStudyDays} />
          <QuickEntryModal />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tests Today"
          value={tests.length}
          description={`${tests.filter((t) => t.type === "overall").length} overall`}
          icon={ClipboardList}
        />
        <StatCard
          title="Remarks"
          value={studyDay?.remarks.length ?? 0}
          description="Notes saved today"
          icon={MessageSquare}
        />
        <StatCard
          title="Pending Tasks"
          value={pendingTasks.length}
          description="Tasks to complete"
          icon={Circle}
          iconClassName="text-amber-500"
        />
        <StatCard
          title="Completed"
          value={completedTasks.length}
          description={completedTasks.length > 0 ? "Great progress!" : "None completed yet"}
          icon={CheckCircle2}
          iconClassName="text-green-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <TestForm defaultDate={today} />
        <RemarkForm defaultDate={today} />
        <TaskForm sourceDate={today} />
      </div>

      {overdueTasks.length > 0 && (
        <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4">
          <h3 className="text-sm font-semibold text-destructive mb-3">
            Unfinished from earlier ({overdueTasks.length})
          </h3>
          <div className="space-y-2">
            {overdueTasks.map((task) => (
              <TaskCard key={task.id} task={task} overdue />
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Today&apos;s Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No tasks scheduled for today.
              </p>
            ) : (
              tasks.map((task) => <TaskCard key={task.id} task={task} />)
            )}
          </CardContent>
        </Card>

        {/* Today's Remarks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Today&apos;s Remarks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!studyDay || studyDay.remarks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No remarks added today.
              </p>
            ) : (
              studyDay.remarks.map((remark, i) => (
                <div key={i} className="rounded-md bg-muted/50 p-3">
                  <p className="text-sm">{remark}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Today's Tests */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Today&apos;s Tests</CardTitle>
          </CardHeader>
          <CardContent>
            {tests.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No tests recorded today.
              </p>
            ) : (
              <div className="space-y-3">
                {tests.map((test) => (
                  <TestCard key={test.id} test={test} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


