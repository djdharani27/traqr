import type { Test, Subject } from "@/types";

export function calculatePercentage(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function getSubjectAverage(
  tests: Test[],
  subject: Subject
): number {
  const filtered = tests.filter((t) => t.subject === subject);
  if (filtered.length === 0) return 0;
  const sum = filtered.reduce((acc, t) => acc + t.percentage, 0);
  return Math.round(sum / filtered.length);
}

export function getOverallAverage(tests: Test[]): number {
  const overall = tests.filter((t) => t.subject === "Overall");
  if (overall.length === 0) return 0;
  const sum = overall.reduce((acc, t) => acc + t.percentage, 0);
  return Math.round(sum / overall.length);
}

export function getWeakSubjects(
  tests: Test[]
): { subject: Subject; average: number }[] {
  const subjects: Subject[] = ["Math", "Reasoning", "GK", "English", "Overall"];
  return subjects
    .map((s) => ({ subject: s, average: getSubjectAverage(tests, s) }))
    .filter((s) => s.average > 0 && s.average < 60);
}

export function getProgressTrend(
  tests: Test[],
  subject: Subject
): { date: string; percentage: number }[] {
  return tests
    .filter((t) => t.subject === subject)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((t) => ({ date: t.date, percentage: t.percentage }));
}

export function getDailyTestCount(
  tests: Test[]
): { date: string; count: number }[] {
  const map = new Map<string, number>();
  for (const t of tests) {
    map.set(t.date, (map.get(t.date) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
}
