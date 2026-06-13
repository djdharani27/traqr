import { requireUser } from "@/lib/auth-server";
import {
  getTestsWithRemarks,
  getAllStudyDays,
} from "@/lib/services";
import { RemarksTable } from "@/components/RemarksTable";
import type { RemarkEntry } from "@/components/RemarksTable";

export default async function RemarksPage() {
  const user = await requireUser();
  const [testRemarks, studyDays] = await Promise.all([
    getTestsWithRemarks(user.uid),
    getAllStudyDays(user.uid),
  ]);

  const allRemarks: RemarkEntry[] = [];

  for (const test of testRemarks) {
    if (test.remark) {
      allRemarks.push({
        date: test.date,
        source: "test",
        content: test.remark,
        subject: test.subject,
        platform: test.platform,
      });
    }
    for (const r of test.remarks ?? []) {
      allRemarks.push({
        date: test.date,
        source: "test",
        content: r.text,
        subject: r.subject ?? test.subject,
        platform: test.platform,
      });
    }
  }

  for (const day of studyDays) {
    const remarks = Array.isArray(day.remarks) ? day.remarks : [];
    for (const remarkText of remarks) {
      allRemarks.push({
        date: day.date,
        source: "study",
        content: remarkText,
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Remarks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {allRemarks.length} remark{allRemarks.length !== 1 ? "s" : ""} across all entries
        </p>
      </div>
      <RemarksTable allRemarks={allRemarks} />
    </div>
  );
}
