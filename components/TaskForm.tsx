"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addTaskAction } from "@/lib/actions";
import { format } from "date-fns";
import { ListTodo } from "lucide-react";

interface TaskFormProps {
  sourceDate?: string;
  defaultTitle?: string;
  onSuccess?: () => void;
}

export function TaskForm({
  sourceDate,
  defaultTitle,
  onSuccess,
}: TaskFormProps) {
  const [open, setOpen] = useState(false);
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <ListTodo className="size-4" />
          Add Revision Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Revision Task</DialogTitle>
          <DialogDescription>
            Schedule a revision task for a future date.
          </DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            await addTaskAction(formData);
            setOpen(false);
            onSuccess?.();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Revise Percentage Chapter"
              defaultValue={defaultTitle ?? ""}
              required
            />
          </div>
          <input
            type="hidden"
            name="sourceDate"
            value={sourceDate ?? today}
          />
          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Date</Label>
            <Input
              id="targetDate"
              name="targetDate"
              type="date"
              defaultValue={today}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Create Task
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
