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
import { Textarea } from "@/components/ui/textarea";
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
      <DialogContent className="sm:max-w-sm max-h-[90vh] overflow-y-auto">
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

          {type === "overall" && (
            <div className="space-y-3 rounded-md border p-3">
              <Label className="text-xs font-semibold">Subject-wise Scores</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Math</Label>
                  <div className="flex gap-1">
                    <Input name="mathCorrect" type="number" placeholder="C" min={0} className="w-full" />
                    <Input name="mathTotal" type="number" placeholder="T" min={0} className="w-full" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Reasoning</Label>
                  <div className="flex gap-1">
                    <Input name="reasoningCorrect" type="number" placeholder="C" min={0} className="w-full" />
                    <Input name="reasoningTotal" type="number" placeholder="T" min={0} className="w-full" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">GK</Label>
                  <div className="flex gap-1">
                    <Input name="gkCorrect" type="number" placeholder="C" min={0} className="w-full" />
                    <Input name="gkTotal" type="number" placeholder="T" min={0} className="w-full" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">English</Label>
                  <div className="flex gap-1">
                    <Input name="englishCorrect" type="number" placeholder="C" min={0} className="w-full" />
                    <Input name="englishTotal" type="number" placeholder="T" min={0} className="w-full" />
                  </div>
                </div>
              </div>
            </div>
          )}

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

          <div className="space-y-2">
            <Label htmlFor="remarkQuick">Remark</Label>
            <Textarea
              id="remarkQuick"
              name="remark"
              placeholder="Optional notes..."
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full" size="sm">
            Save
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
