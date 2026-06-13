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
import { calculateMarks, calculateUnanswered, calculatePercentageFromMarks } from "@/lib/calculations";
import { format } from "date-fns";
import { Zap, Plus, X } from "lucide-react";
import type { TestType, Subject } from "@/types";

const SUBJECTS: Subject[] = ["Math", "Reasoning", "GK", "English"];
const DEFAULT_TOTAL = 25;

interface SectionInput {
  correct: string;
  incorrect: string;
  total: string;
}

function defaultSection(): SectionInput {
  return { correct: "", incorrect: "", total: String(DEFAULT_TOTAL) };
}

function calcSection(s: SectionInput) {
  const c = parseInt(s.correct) || 0;
  const ic = parseInt(s.incorrect) || 0;
  const t = parseInt(s.total) || DEFAULT_TOTAL;
  const unanswered = calculateUnanswered(t, c, ic);
  const marks = calculateMarks(c, ic);
  const maxMarks = t * 2;
  const pct = calculatePercentageFromMarks(marks, t);
  return { c, ic, t, unanswered, marks, maxMarks, pct };
}

function SectionInputs({
  correctName,
  incorrectName,
  totalName,
  label,
  value,
  onChange,
}: {
  correctName: string;
  incorrectName: string;
  totalName: string;
  label: string;
  value: SectionInput;
  onChange: (v: SectionInput) => void;
}) {
  const { unanswered, marks, maxMarks, pct } = calcSection(value);

  return (
    <div className="rounded-md border p-2 space-y-1">
      <Label className="text-xs font-semibold">{label}</Label>
      <div className="grid grid-cols-3 gap-1">
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Correct</Label>
          <Input
            name={correctName}
            type="number"
            min={0}
            placeholder="0"
            value={value.correct}
            onChange={(e) => onChange({ ...value, correct: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Incorrect</Label>
          <Input
            name={incorrectName}
            type="number"
            min={0}
            placeholder="0"
            value={value.incorrect}
            onChange={(e) => onChange({ ...value, incorrect: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Total Qs</Label>
          <Input
            name={totalName}
            type="number"
            min={1}
            value={value.total}
            onChange={(e) => onChange({ ...value, total: e.target.value })}
          />
        </div>
      </div>
      <div className="flex gap-3 text-[10px] text-muted-foreground">
        <span>Unans: <strong>{unanswered}</strong></span>
        <span>Marks: <strong className={marks >= 0 ? "text-green-500" : "text-red-500"}>{marks}/{maxMarks}</strong></span>
        <span>%: <strong className={pct >= 70 ? "text-green-500" : pct >= 50 ? "text-amber-500" : "text-red-500"}>{pct}%</strong></span>
      </div>
    </div>
  );
}

function RemarksSection({ subject }: { subject?: Subject }) {
  const [remarks, setRemarks] = useState<string[]>([""]);

  const addRemark = () => setRemarks([...remarks, ""]);
  const removeRemark = (i: number) => {
    if (remarks.length <= 1) return;
    setRemarks(remarks.filter((_, idx) => idx !== i));
  };
  const updateRemark = (i: number, val: string) => {
    const next = [...remarks];
    next[i] = val;
    setRemarks(next);
  };

  const namePrefix = subject ? `remark_${subject}` : "remarkText";

  return (
    <div className="space-y-1">
      <Label className="text-xs font-semibold">Remarks {subject ? `(${subject})` : ""}</Label>
      {remarks.map((r, i) => (
        <div key={i} className="flex gap-1">
          <Textarea
            name={i === 0 ? namePrefix : undefined}
            placeholder="Add a remark..."
            rows={2}
            value={r}
            onChange={(e) => updateRemark(i, e.target.value)}
          />
          {remarks.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 size-8"
              onClick={() => removeRemark(i)}
            >
              <X className="size-3" />
            </Button>
          )}
        </div>
      ))}
      {remarks.slice(1).map((r, i) =>
        r.trim() ? (
          <input key={`hidden-${i}`} type="hidden" name={namePrefix} value={r.trim()} />
        ) : null
      )}
      <Button type="button" variant="outline" size="sm" onClick={addRemark}>
        <Plus className="size-3 mr-1" /> Add Remark
      </Button>
    </div>
  );
}

function OverallTotals({
  sections,
}: {
  sections: Record<string, SectionInput>;
}) {
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalQs = 0;

  for (const key of SUBJECTS) {
    const s = sections[key.toLowerCase()];
    if (!s) continue;
    totalCorrect += parseInt(s.correct) || 0;
    totalIncorrect += parseInt(s.incorrect) || 0;
    totalQs += parseInt(s.total) || DEFAULT_TOTAL;
  }

  const unanswered = calculateUnanswered(totalQs, totalCorrect, totalIncorrect);
  const marks = calculateMarks(totalCorrect, totalIncorrect);
  const maxMarks = totalQs * 2;
  const pct = calculatePercentageFromMarks(marks, totalQs);

  return (
    <div className="rounded-md border bg-muted/30 p-2 space-y-1">
      <Label className="text-xs font-semibold">Overall Summary</Label>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0 text-xs">
        <span className="text-muted-foreground">Total Correct:</span>
        <span className="font-medium">{totalCorrect}</span>
        <span className="text-muted-foreground">Total Incorrect:</span>
        <span className="font-medium">{totalIncorrect}</span>
        <span className="text-muted-foreground">Total Unanswered:</span>
        <span className="font-medium">{unanswered}</span>
        <span className="text-muted-foreground">Marks:</span>
        <span className={`font-bold ${marks >= 0 ? "text-green-500" : "text-red-500"}`}>
          {marks}/{maxMarks}
        </span>
        <span className="text-muted-foreground">Percentage:</span>
        <span className={`font-bold ${pct >= 70 ? "text-green-500" : pct >= 50 ? "text-amber-500" : "text-red-500"}`}>
          {pct}%
        </span>
      </div>
    </div>
  );
}

export function QuickEntryModal() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TestType>("sectional");

  const [sectional, setSectional] = useState<SectionInput>(defaultSection());
  const [overallSections, setOverallSections] = useState<Record<string, SectionInput>>({
    math: defaultSection(),
    reasoning: defaultSection(),
    gk: defaultSection(),
    english: defaultSection(),
  });

  const today = format(new Date(), "yyyy-MM-dd");

  const updateOverall = (prefix: string, v: SectionInput) => {
    setOverallSections((prev) => ({ ...prev, [prefix]: v }));
  };

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
            setSectional(defaultSection());
            setOverallSections({
              math: defaultSection(),
              reasoning: defaultSection(),
              gk: defaultSection(),
              english: defaultSection(),
            });
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
                  {SUBJECTS.map((s) => (
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

          {type === "sectional" && (
            <SectionInputs
              correctName="correct"
              incorrectName="incorrect"
              totalName="total"
              label="Question Details"
              value={sectional}
              onChange={setSectional}
            />
          )}

          {type === "overall" && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Subject-wise Scores</Label>
              {SUBJECTS.map((s) => {
                const key = s.toLowerCase();
                return (
                  <SectionInputs
                    key={s}
                    correctName={`${key}Correct`}
                    incorrectName={`${key}Incorrect`}
                    totalName={`${key}Total`}
                    label={s}
                    value={overallSections[key]}
                    onChange={(v) => updateOverall(key, v)}
                  />
                );
              })}
              <OverallTotals sections={overallSections} />
            </div>
          )}

          {type === "sectional" && (
            <RemarksSection subject={undefined} />
          )}

          {type === "overall" && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Subject-wise Remarks</Label>
              {SUBJECTS.map((s) => (
                <RemarksSection key={s} subject={s} />
              ))}
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
