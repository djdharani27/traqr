import { getCurrentUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { getTests } from "@/lib/services";
import {
  getSubjectAverage,
  getOverallAverage,
  getWeakSubjects,
  getProgressTrend,
} from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { SubjectProgressChart } from "@/components/SubjectProgressChart";
import { OverallProgressChart } from "@/components/OverallProgressChart";
import { WeakSubjectCards } from "@/components/WeakSubjectCards";
import { Separator } from "@/components/ui/separator";
import type { Subject } from "@/types";
import {
  BarChart3,
  TrendingUp,
  Target,
  AlertTriangle,
} from "lucide-react";

const subjects: Subject[] = ["Math", "Reasoning", "GK", "English"];

export default async function AnalyticsPage() {
  const tests = await getTests("default-user");

  const subjectAverages = subjects.map((s) => ({
    subject: s,
    average: getSubjectAverage(tests, s),
  }));
  const overallAvg = getOverallAverage(tests);
  const weakSubjects = getWeakSubjects(tests);
  const totalTests = tests.length;

  const overallTrend = getProgressTrend(tests, "Overall");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your performance across subjects
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tests"
          value={totalTests}
          icon={BarChart3}
        />
        <StatCard
          title="Overall Average"
          value={overallAvg > 0 ? `${overallAvg}%` : "—"}
          description="Overall mock tests"
          icon={Target}
        />
        <StatCard
          title="Best Subject"
          value={
            subjectAverages.reduce((best, s) =>
              s.average > best.average ? s : best
            ).subject
          }
          description={
            subjectAverages.some((s) => s.average > 0)
              ? `${
                  subjectAverages.reduce((best, s) =>
                    s.average > best.average ? s : best
                  ).average
                }%`
              : "No data"
          }
          icon={TrendingUp}
        />
        <StatCard
          title="Weak Subjects"
          value={weakSubjects.length}
          description="Below 60%"
          icon={AlertTriangle}
          iconClassName="text-amber-500"
        />
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {subjectAverages.map(({ subject, average }) => (
          <Card key={subject}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {subject}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {average > 0 ? `${average}%` : "—"}
              </p>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Overall
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {overallAvg > 0 ? `${overallAvg}%` : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {weakSubjects.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">⚠️ Weak Subjects</h2>
          <WeakSubjectCards subjects={weakSubjects} />
        </div>
      )}

      <Separator />

      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Subject Progress</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {subjects.map((subject) => (
            <Card key={subject}>
              <CardHeader>
                <CardTitle className="text-sm">{subject}</CardTitle>
              </CardHeader>
              <CardContent>
                <SubjectProgressChart
                  data={getProgressTrend(tests, subject)}
                  subject={subject}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {overallTrend.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Overall Mock Progress</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Overall Test Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <OverallProgressChart data={overallTrend} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
