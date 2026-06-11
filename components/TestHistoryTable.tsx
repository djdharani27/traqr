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
import { Trash2, Pencil } from "lucide-react";
import type { Test } from "@/types";
import { useState } from "react";
import { TestForm } from "./TestForm";

interface TestHistoryTableProps {
  tests: Test[];
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
          <TableHead>Score</TableHead>
          <TableHead>%</TableHead>
          <TableHead className="w-[60px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((test) => (
          <TableRow key={test.id}>
            <TableCell className="font-medium">
              {format(parseISO(test.date), "MMM d, yyyy")}
            </TableCell>
            <TableCell>
              <Badge
                variant={test.type === "overall" ? "default" : "secondary"}
              >
                {test.type}
              </Badge>
            </TableCell>
            <TableCell>{test.subject}</TableCell>
            <TableCell>{test.platform}</TableCell>
            <TableCell>
              {test.correct}/{test.total}
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
        ))}
      </TableBody>
    </Table>
  );
}
