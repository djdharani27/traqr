import { requireUser } from "@/lib/auth-server";
import {
  getTestsWithRemarks,
  getAllStudyDays,
} from "@/lib/services";
import { format, parseISO } from "date-fns";
import { MessageSquareText, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export default async function RemarksPage() {
  const user = await requireUser();
  const [testRemarks, studyDays] = await Promise.all([
    getTestsWithRemarks(user.uid),
    getAllStudyDays(user.uid),
  ]);

  const allRemarks: {
    date: string;
    source: "test" | "study";
    content: string;
    subject?: string;
    platform?: string;
  }[] = [];

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
  }

  for (const day of studyDays) {
    if (day.remarks.length > 0) {
      for (const remarkText of day.remarks) {
        allRemarks.push({
          date: day.date,
          source: "study",
          content: remarkText,
        });
      }
    }
  }

  allRemarks.sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Remarks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {allRemarks.length} remark{allRemarks.length !== 1 ? "s" : ""} across all entries
          </p>
        </div>
      </div>

      {allRemarks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <MessageSquareText className="size-12 mx-auto mb-3 opacity-30" />
            <p>No remarks yet. Add remarks when logging a test or from the Today page.</p>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Remark</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allRemarks.map((remark, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium whitespace-nowrap">
                  <Link
                    href={`/day/${remark.date}`}
                    className="hover:underline"
                  >
                    {format(parseISO(remark.date), "MMM d, yyyy")}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={remark.source === "test" ? "default" : "secondary"}
                  >
                    {remark.source === "test" ? (
                      <ClipboardList className="size-3 mr-1" />
                    ) : (
                      <MessageSquareText className="size-3 mr-1" />
                    )}
                    {remark.source}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {remark.source === "test" && remark.subject && (
                    <>
                      {remark.subject}
                      {remark.platform && ` — ${remark.platform}`}
                    </>
                  )}
                  {remark.source === "study" && "Study day note"}
                </TableCell>
                <TableCell className="text-sm max-w-md">
                  {remark.content}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
