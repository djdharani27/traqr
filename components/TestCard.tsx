"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { deleteTestAction } from "@/lib/actions";
import { MessageSquare, Trash2 } from "lucide-react";
import type { Test } from "@/types";

interface TestCardProps {
  test: Test;
  showDelete?: boolean;
}

export function TestCard({ test, showDelete = false }: TestCardProps) {
  const subjects = test.subjectScores
    ? [
        { label: "Math", s: test.subjectScores.math },
        { label: "Reasoning", s: test.subjectScores.reasoning },
        { label: "GK", s: test.subjectScores.gk },
        { label: "English", s: test.subjectScores.english },
      ]
    : null;

  const allRemarks = test.remarks?.length
    ? test.remarks
    : test.remark
    ? [{ text: test.remark }]
    : [];

  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant={test.type === "overall" ? "default" : "secondary"}
          >
            {test.type}
          </Badge>
          {test.type === "overall" && subjects ? (
            <Tooltip>
              <TooltipTrigger className="inline-flex items-center">
                <span className="font-medium text-sm cursor-help underline decoration-dotted">
                  {test.subject}
                </span>
              </TooltipTrigger>
              <TooltipContent className="space-y-1 text-xs">
                {subjects.map((s) => {
                  const pct = s.s.total > 0 ? Math.round(((s.s.correct * 2 - s.s.incorrect * 0.5) / (s.s.total * 2)) * 100) : null;
                  return (
                    <div key={s.label} className="flex justify-between gap-4">
                      <span>{s.label}</span>
                      <span>
                        {s.s.correct}/{s.s.incorrect}/{s.s.total}
                        {pct !== null && (
                          <span className={pct >= 70 ? "text-green-400 ml-1" : pct >= 50 ? "text-amber-400 ml-1" : "text-red-400 ml-1"}>
                            ({pct}%)
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="font-medium text-sm">{test.subject}</span>
          )}
          <span className="text-xs text-muted-foreground">{test.platform}</span>
          {allRemarks.length > 0 && (
            <Tooltip>
              <TooltipTrigger className="inline-flex items-center">
                <MessageSquare className="size-3 text-muted-foreground shrink-0" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs space-y-1">
                {allRemarks.map((r, i) => (
                  <div key={i}>
                    {r.subject && <span className="text-muted-foreground">[{r.subject}] </span>}
                    {r.text}
                  </div>
                ))}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {test.correct} correct · {test.incorrect} incorrect · {test.unanswered} unanswered
        </p>
        <p className="text-xs text-muted-foreground">
          Marks: <span className={test.marks >= 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>{test.marks}/{test.total * 2}</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-lg font-bold ${
            test.percentage >= 70
              ? "text-green-500"
              : test.percentage >= 50
              ? "text-amber-500"
              : "text-red-500"
          }`}
        >
          {test.percentage}%
        </span>
        {showDelete && (
          <form
            action={async () => {
              await deleteTestAction(test.id, test.date);
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
        )}
      </div>
    </div>
  );
}
