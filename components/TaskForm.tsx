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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { addTaskAction } from "@/lib/actions";
import { format, addDays } from "date-fns";
import { ListTodo, RefreshCw } from "lucide-react";

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
  const [classicCycle, setClassicCycle] = useState(false);
  const today = format(new Date(), "yyyy-MM-dd");
  const defaultTarget = classicCycle
    ? format(addDays(new Date(), 1), "yyyy-MM-dd")
    : today;

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
            setClassicCycle(false);
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
          <input
            type="hidden"
            name="classicCycle"
            value={String(classicCycle)}
          />
          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Date</Label>
            <Input
              id="targetDate"
              name="targetDate"
              type="date"
              defaultValue={defaultTarget}
              required
            />
          </div>
          <div className="flex items-start gap-3 rounded-md border p-3">
            <Checkbox
              id="classicCycle"
              checked={classicCycle}
              onCheckedChange={(v) => setClassicCycle(Boolean(v))}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="classicCycle"
                className="flex items-center gap-1.5 text-sm font-medium leading-none cursor-pointer"
              >
                <RefreshCw className="size-3.5" />
                Classic Cycle
              </label>
              <p className="text-xs text-muted-foreground">
                Task repeats 3 times every 3 days, then once after 4 days, then once after 5 days — only when you mark it complete each time.
              </p>
            </div>
          </div>
          <Button type="submit" className="w-full">
            Create Task
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
