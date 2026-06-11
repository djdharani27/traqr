import { getTests, getStudyDay, getTasksByTargetDate, getAllStudyDays, getAllTasks } from "@/lib/services";
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
import { QuickEntryModal } from "./QuickEntryModal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SearchBar } from "./SearchBar";

export async function TodayDashboard() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [tests, studyDay, tasks, allStudyDays, allTasks, allTests] =
    await Promise.all([
      getTests(today),
      getStudyDay(today),
      getTasksByTargetDate(today),
      getAllStudyDays(),
      getAllTasks(),
      getTests(),
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
                  <div
                    key={test.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            test.type === "overall" ? "default" : "secondary"
                          }
                        >
                          {test.type}
                        </Badge>
                        <span className="font-medium text-sm">
                          {test.subject}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {test.platform}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {test.correct}/{test.total} correct
                      </p>
                    </div>
                    <span
                      className={`text-lg font-bold ${
                        test.percentage >= 70
                          ? "text-green-500"
                          : test.percentage >= 50
                          ? "text-amber-500"
                          : "text-red-500"
                      }`}
                    >
                      {test.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


