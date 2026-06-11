"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { completeTaskAction, deleteTaskAction } from "@/lib/actions";
import { format, parseISO } from "date-fns";
import { Trash2 } from "lucide-react";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
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
        <p
          className={`text-sm font-medium ${
            task.completed ? "line-through text-muted-foreground" : ""
          }`}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs">
            {format(parseISO(task.targetDate), "MMM d, yyyy")}
          </Badge>
        </div>
      </div>
      <form
        action={async () => {
          await deleteTaskAction(task.id);
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
  );
}
