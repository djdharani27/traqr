import { getTests, getStudyDay, getTasksByTargetDate } from "@/lib/services";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TestForm } from "@/components/TestForm";
import { RemarkForm } from "@/components/RemarkForm";
import { TaskForm } from "@/components/TaskForm";
import { RemarkCard } from "@/components/RemarkCard";
import { TaskCard } from "@/components/TaskCard";
import { deleteTestAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DayPageProps {
  params: Promise<{ date: string }>;
}

export default async function DayPage({ params }: DayPageProps) {
  const { date } = await params;
  const [tests, studyDay, tasks] = await Promise.all([
    getTests("default-user", date),
    getStudyDay("default-user", date),
    getTasksByTargetDate("default-user", date),
  ]);

  const formattedDate = format(parseISO(date), "EEEE, MMMM d, yyyy");
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{formattedDate}</h1>
          <p className="text-sm text-muted-foreground mt-1">Daily study overview</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <TestForm defaultDate={date} />
          <RemarkForm defaultDate={date} />
          <TaskForm sourceDate={date} />
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Tests</CardTitle>
          </CardHeader>
          <CardContent>
            {tests.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No tests recorded for this date.
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
                          variant={test.type === "overall" ? "default" : "secondary"}
                        >
                          {test.type}
                        </Badge>
                        <span className="font-medium text-sm">{test.subject}</span>
                        <span className="text-xs text-muted-foreground">
                          {test.platform}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {test.correct}/{test.total} correct
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
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
                      <form
                        action={async () => {
                          "use server";
                          await deleteTestAction(test.id, test.date);
                        }}
                      >
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Remarks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!studyDay || studyDay.remarks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No remarks for this date.
              </p>
            ) : (
              studyDay.remarks.map((remark, i) => (
                <RemarkCard key={i} date={date} remark={remark} index={i} />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No tasks scheduled for this date.
              </p>
            ) : (
              <>
                {pendingTasks.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Pending ({pendingTasks.length})
                    </p>
                    {pendingTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                )}
                {completedTasks.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Completed ({completedTasks.length})
                    </p>
                    {completedTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
