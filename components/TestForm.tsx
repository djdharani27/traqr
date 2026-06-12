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
import { Plus } from "lucide-react";
import type { TestType, Subject } from "@/types";

const subjects: Subject[] = ["Math", "Reasoning", "GK", "English"];

const platforms = [
  "Oliveboard",
  "Testbook",
  "PracticeMock",
  "Adda247",
  "Custom",
];

interface TestFormProps {
  defaultDate?: string;
  onSuccess?: () => void;
}

export function TestForm({ defaultDate, onSuccess }: TestFormProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TestType>("sectional");
  const [correct, setCorrect] = useState("");
  const [total, setTotal] = useState("");
  const [platform, setPlatform] = useState("Oliveboard");
  const [customPlatform, setCustomPlatform] = useState("");

  const today = format(new Date(), "yyyy-MM-dd");
  const percentage =
    correct && total && parseInt(total) > 0
      ? Math.round((parseInt(correct) / parseInt(total)) * 100)
      : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Plus className="size-4" />
          Add Test
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Test</DialogTitle>
          <DialogDescription>
            Record a sectional or overall mock test.
          </DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            await addTestAction(formData);
            setOpen(false);
            setCorrect("");
            setTotal("");
            onSuccess?.();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={defaultDate ?? today}
              required
            />
          </div>
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
            <Select
              value={platform}
              onValueChange={(v) => setPlatform(v)}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {platform === "Custom" && (
              <Input
                name="platformCustom"
                placeholder="Enter custom platform name"
                value={customPlatform}
                onChange={(e) => setCustomPlatform(e.target.value)}
                required
              />
            )}
            <input
              type="hidden"
              name="platform"
              value={platform === "Custom" ? customPlatform : platform}
            />
          </div>

          {/* Overall subject-wise breakdown */}
          {type === "overall" && (
            <div className="space-y-3 rounded-md border p-3">
              <Label className="text-sm font-semibold">Subject-wise Scores</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Math</Label>
                  <div className="flex gap-2">
                    <Input
                      name="mathCorrect"
                      type="number"
                      placeholder="C"
                      min={0}
                      className="w-full"
                    />
                    <Input
                      name="mathTotal"
                      type="number"
                      placeholder="T"
                      min={0}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Reasoning</Label>
                  <div className="flex gap-2">
                    <Input
                      name="reasoningCorrect"
                      type="number"
                      placeholder="C"
                      min={0}
                      className="w-full"
                    />
                    <Input
                      name="reasoningTotal"
                      type="number"
                      placeholder="T"
                      min={0}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">GK</Label>
                  <div className="flex gap-2">
                    <Input
                      name="gkCorrect"
                      type="number"
                      placeholder="C"
                      min={0}
                      className="w-full"
                    />
                    <Input
                      name="gkTotal"
                      type="number"
                      placeholder="T"
                      min={0}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">English</Label>
                  <div className="flex gap-2">
                    <Input
                      name="englishCorrect"
                      type="number"
                      placeholder="C"
                      min={0}
                      className="w-full"
                    />
                    <Input
                      name="englishTotal"
                      type="number"
                      placeholder="T"
                      min={0}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="correct">Correct</Label>
              <Input
                id="correct"
                name="correct"
                type="number"
                min={0}
                required
                value={correct}
                onChange={(e) => setCorrect(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total">Total Questions</Label>
              <Input
                id="total"
                name="total"
                type="number"
                min={1}
                required
                value={total}
                onChange={(e) => setTotal(e.target.value)}
              />
            </div>
          </div>
          {percentage !== null && (
            <div className="rounded-md bg-muted p-3 text-center">
              <span className="text-sm text-muted-foreground">Score: </span>
              <span
                className={`text-lg font-bold ${
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

          {/* Remark field */}
          <div className="space-y-2">
            <Label htmlFor="remark">Remark</Label>
            <Textarea
              id="remark"
              name="remark"
              placeholder="Optional notes about this test..."
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full">
            Save Test
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
