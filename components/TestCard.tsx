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
        { label: "Math", correct: test.subjectScores.mathCorrect, total: test.subjectScores.mathTotal },
        { label: "Reasoning", correct: test.subjectScores.reasoningCorrect, total: test.subjectScores.reasoningTotal },
        { label: "GK", correct: test.subjectScores.gkCorrect, total: test.subjectScores.gkTotal },
        { label: "English", correct: test.subjectScores.englishCorrect, total: test.subjectScores.englishTotal },
      ]
    : null;

  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
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
                  const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : null;
                  return (
                    <div key={s.label} className="flex justify-between gap-4">
                      <span>{s.label}</span>
                      <span>
                        {s.correct}/{s.total}
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
          {test.remark && (
            <Tooltip>
              <TooltipTrigger className="inline-flex items-center">
                <MessageSquare className="size-3 text-muted-foreground shrink-0" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                {test.remark}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {test.correct}/{test.total} correct
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
