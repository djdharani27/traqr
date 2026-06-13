"use client";

import { useState } from "react";
import Link from "next/link";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
  isSameMonth,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Test, StudyDay, Task } from "@/types";

interface CalendarViewProps {
  tests: Test[];
  studyDays: StudyDay[];
  tasks: Task[];
}

export function CalendarView({
  tests,
  studyDays,
  tasks,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const testDates = new Set(tests.map((t) => t.date));
  const remarkDates = new Set(
    studyDays
      .filter((d) => {
        const rem = d.remarks;
        return Array.isArray(rem) && rem.length > 0;
      })
      .map((d) => d.date)
  );
  const taskDates = new Set(tasks.map((t) => t.targetDate));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden text-sm">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div
            key={day}
            className="bg-card p-2 text-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const hasTests = testDates.has(dateStr);
          const hasRemarks = remarkDates.has(dateStr);
          const hasTasks = taskDates.has(dateStr);

          return (
            <Link
              key={dateStr}
              href={`/day/${dateStr}`}
              className={cn(
                "bg-card p-2 min-h-[80px] hover:bg-accent transition-colors block",
                !isSameMonth(day, currentMonth) && "opacity-40",
                isToday(day) && "ring-2 ring-primary ring-inset"
              )}
            >
              <span
                className={cn(
                  "text-xs font-medium",
                  isToday(day) && "text-primary"
                )}
              >
                {format(day, "d")}
              </span>
              <div className="flex gap-1 mt-1">
                {hasTests && (
                  <span className="size-2 rounded-full bg-green-500" />
                )}
                {hasRemarks && (
                  <span className="size-2 rounded-full bg-blue-500" />
                )}
                {hasTasks && (
                  <span className="size-2 rounded-full bg-orange-500" />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-green-500" />
          Tests
        </div>
        <div className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-blue-500" />
          Remarks
        </div>
        <div className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-orange-500" />
          Tasks
        </div>
      </div>
    </div>
  );
}
