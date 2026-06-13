"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteTestAction } from "@/lib/actions";
import { format, parseISO } from "date-fns";
import { Trash2, MessageSquare } from "lucide-react";
import type { Test } from "@/types";
import { useState } from "react";
import { TestForm } from "./TestForm";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TestHistoryTableProps {
  tests: Test[];
}

function SubjectScorePopover({ test }: { test: Test }) {
  if (!test.subjectScores) return null;

  const subjects = [
    { label: "Math", s: test.subjectScores.math },
    { label: "Reasoning", s: test.subjectScores.reasoning },
    { label: "GK", s: test.subjectScores.gk },
    { label: "English", s: test.subjectScores.english },
  ];

  return (
    <Tooltip>
      <TooltipTrigger className="inline-flex items-center">
        <span className="cursor-help text-xs text-muted-foreground underline decoration-dotted">
          {test.subject}
        </span>
      </TooltipTrigger>
      <TooltipContent className="space-y-1 text-xs">
        {subjects.map((s) => {
          if (!s.s) return null;
          const marks = s.s.correct * 2 - s.s.incorrect * 0.5;
          const maxMarks = s.s.total * 2;
          const pct = s.s.total > 0 ? Math.round((marks / maxMarks) * 100) : null;
          return (
            <div key={s.label} className="flex justify-between gap-4">
              <span>{s.label}</span>
              <span>
                C:{s.s.correct} I:{s.s.incorrect} T:{s.s.total}
                {pct !== null && (
                  <span className={pct >= 70 ? "text-green-400 ml-1" : pct >= 50 ? "text-amber-400 ml-1" : "text-red-400 ml-1"}>
                    ({pct}%)
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </TooltipContent>
    </Tooltip>
  );
}

export function TestHistoryTable({ tests }: TestHistoryTableProps) {
  const [editingTest, setEditingTest] = useState<Test | null>(null);

  if (tests.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No tests recorded yet. Add your first test to start tracking.
      </div>
    );
  }

  const sorted = [...tests].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Platform</TableHead>
          <TableHead>C / I / U</TableHead>
          <TableHead>Marks</TableHead>
          <TableHead>%</TableHead>
          <TableHead className="w-[30px]"></TableHead>
          <TableHead className="w-[60px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((test) => {
          const allRemarks = test.remarks?.length
            ? test.remarks
            : test.remark
            ? [{ text: test.remark }]
            : [];

          return (
          <TableRow key={test.id}>
            <TableCell className="font-medium whitespace-nowrap">
              {format(parseISO(test.date), "MMM d, yyyy")}
            </TableCell>
            <TableCell>
              <Badge
                variant={test.type === "overall" ? "default" : "secondary"}
              >
                {test.type}
              </Badge>
            </TableCell>
            <TableCell>
              {test.type === "overall" && test.subjectScores ? (
                <SubjectScorePopover test={test} />
              ) : (
                test.subject
              )}
            </TableCell>
            <TableCell>{test.platform}</TableCell>
            <TableCell className="text-sm">
              <span className="text-green-500 font-medium">{test.correct}</span>
              {" / "}
              <span className="text-red-500 font-medium">{test.incorrect}</span>
              {" / "}
              <span className="text-muted-foreground">{test.unanswered}</span>
              <span className="text-muted-foreground text-xs ml-1">(of {test.total})</span>
            </TableCell>
            <TableCell>
              <span className={test.marks >= 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                {test.marks}
              </span>
              <span className="text-muted-foreground text-sm">/{test.total * 2}</span>
            </TableCell>
            <TableCell>
              <span
                className={`font-medium ${
                  test.percentage >= 70
                    ? "text-green-500"
                    : test.percentage >= 50
                    ? "text-amber-500"
                    : "text-red-500"
                }`}
              >
                {test.percentage}%
              </span>
            </TableCell>
            <TableCell>
              {allRemarks.length > 0 && (
                <Tooltip>
                  <TooltipTrigger className="inline-flex items-center">
                    <MessageSquare className="size-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs space-y-1">
                    {allRemarks.map((r, i) => (
                      <div key={i}>
                        {r.subject && <span className="text-muted-foreground">[{r.subject}] </span>}
                        {r.text}
                      </div>
                    ))}
                  </TooltipContent>
                </Tooltip>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <TestForm defaultDate={test.date} />
                <form
                  action={async () => {
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
            </TableCell>
          </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
