"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { completeTaskAction, deleteTaskAction, skipTaskAction } from "@/lib/actions";
import { format, parseISO } from "date-fns";
import { Trash2, RefreshCw, ChevronRight } from "lucide-react";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  overdue?: boolean;
}

export function TaskCard({ task, overdue }: TaskCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-md border p-3">
      <label
        className="flex items-center justify-center size-8 mt-0.5 cursor-pointer rounded-md hover:bg-accent"
        onClick={async (e) => {
          e.preventDefault();
          await completeTaskAction(task.id);
        }}
      >
        <Checkbox
          checked={task.completed}
          className="pointer-events-none"
        />
      </label>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className={`text-sm font-medium ${
              task.completed ? "line-through text-muted-foreground" : ""
            }`}
          >
            {task.title}
          </p>
          {task.classicCycle && (
            <Badge variant="outline" className="text-xs gap-1">
              <RefreshCw className="size-3" />
              Cycle {(task.cycleNumber ?? 0) + 1}/5
            </Badge>
          )}
          {overdue && (
            <Badge variant="destructive" className="text-xs gap-1">
              <ChevronRight className="size-3" />
              Unfinished
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs">
            {format(parseISO(task.targetDate), "MMM d, yyyy")}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {overdue && !task.completed && (
          <form action={async () => { await skipTaskAction(task.id); }}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Skip
            </Button>
          </form>
        )}
        <form action={async () => { await deleteTaskAction(task.id); }}>
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
  );
}
