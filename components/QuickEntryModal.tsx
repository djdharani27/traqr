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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addTestAction } from "@/lib/actions";
import { format } from "date-fns";
import { Zap } from "lucide-react";
import type { TestType, Subject } from "@/types";

const subjects: Subject[] = ["Math", "Reasoning", "GK", "English"];

export function QuickEntryModal() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TestType>("sectional");
  const [correct, setCorrect] = useState("");
  const [total, setTotal] = useState("");

  const today = format(new Date(), "yyyy-MM-dd");
  const percentage =
    correct && total && parseInt(total) > 0
      ? Math.round((parseInt(correct) / parseInt(total)) * 100)
      : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Zap className="size-4" />
          Quick Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Quick Test Entry</DialogTitle>
          <DialogDescription>
            Log a test in seconds. Date defaults to today.
          </DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            await addTestAction(formData);
            setOpen(false);
            setCorrect("");
            setTotal("");
          }}
          className="space-y-3"
        >
          <input type="hidden" name="date" value={today} />
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              name="type"
              value={type}
              onValueChange={(v) => setType(v as TestType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sectional">Sectional</SelectItem>
                <SelectItem value="overall">Overall</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {type === "sectional" ? (
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select name="subject" required defaultValue="Math">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <input type="hidden" name="subject" value="Overall" />
          )}
          <div className="space-y-2">
            <Label>Platform</Label>
            <Input
              name="platform"
              placeholder="Oliveboard"
              defaultValue="Oliveboard"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Correct</Label>
              <Input
                name="correct"
                type="number"
                placeholder="0"
                min={0}
                required
                value={correct}
                onChange={(e) => setCorrect(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Total</Label>
              <Input
                name="total"
                type="number"
                placeholder="0"
                min={1}
                required
                value={total}
                onChange={(e) => setTotal(e.target.value)}
              />
            </div>
          </div>
          {percentage !== null && (
            <div className="text-center py-2 rounded-md bg-muted">
              <span
                className={`text-xl font-bold ${
                  percentage >= 70
                    ? "text-green-500"
                    : percentage >= 50
                    ? "text-amber-500"
                    : "text-red-500"
                }`}
              >
                {percentage}%
              </span>
            </div>
          )}
          <Button type="submit" className="w-full" size="sm">
            Save
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
