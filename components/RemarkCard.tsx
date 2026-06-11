"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { deleteRemarkAction } from "@/lib/actions";
import { Trash2, BookmarkPlus } from "lucide-react";
import { useState } from "react";
import { TaskForm } from "./TaskForm";

interface RemarkCardProps {
  date: string;
  remark: string;
  index: number;
}

export function RemarkCard({ date, remark, index }: RemarkCardProps) {
  const [showTaskForm, setShowTaskForm] = useState(false);

  return (
    <div className="flex items-start gap-3 rounded-md border p-3 group">
      <div className="flex-1 min-w-0">
        <p className="text-sm">{remark}</p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <TaskForm
          sourceDate={date}
          defaultTitle={`Revise: ${remark.slice(0, 40)}${remark.length > 40 ? "..." : ""}`}
        />
        <form
          action={async () => {
            await deleteRemarkAction(date, index);
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
  );
}
