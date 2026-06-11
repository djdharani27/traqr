"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import type { Subject } from "@/types";

interface WeakSubjectCardsProps {
  subjects: { subject: Subject; average: number }[];
}

export function WeakSubjectCards({ subjects }: WeakSubjectCardsProps) {
  if (subjects.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {subjects.map((s) => (
        <Card key={s.subject} className="border-amber-200 dark:border-amber-800">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <AlertTriangle className="size-5 text-amber-500" />
            <CardTitle className="text-sm font-medium">Weak Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{s.subject}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">Average:</span>
              <Badge variant="destructive">{s.average}%</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Needs improvement — focus on more practice.
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
