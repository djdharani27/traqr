"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight } from "lucide-react";
import type { Test, StudyDay } from "@/types";
import { format, parseISO } from "date-fns";

interface SearchBarProps {
  tests: Test[];
  studyDays: StudyDay[];
}

export function SearchBar({ tests, studyDays }: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();

    const testResults = tests
      .filter(
        (t) =>
          t.date.includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.platform.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map((t) => ({
        type: "test" as const,
        label: `${t.subject} (${t.platform}) — ${t.percentage}%`,
        date: t.date,
        id: t.id,
      }));

    const remarkResults = studyDays
      .filter((d) => d.remarks.some((r) => r.toLowerCase().includes(q)))
      .slice(0, 3)
      .map((d) => {
        const remark = d.remarks.find((r) => r.toLowerCase().includes(q))!;
        return {
          type: "remark" as const,
          label:
            remark.length > 60 ? remark.slice(0, 60) + "..." : remark,
          date: d.date,
          id: d.id,
        };
      });

    return [...testResults, ...remarkResults];
  }, [query, tests, studyDays]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Search className="size-4" />
          Search
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>
            Search by date, subject, platform, or remark text.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((r, i) => (
                <Button
                  key={`${r.type}-${i}`}
                  variant="ghost"
                  className="w-full justify-between h-auto py-2 px-3"
                  onClick={() => {
                    router.push(`/day/${r.date}`);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <div className="flex flex-col items-start gap-0.5 text-left">
                    <span className="text-sm">{r.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(r.date), "MMM d, yyyy")} • {r.type}
                    </span>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Button>
              ))}
            </div>
          )}
          {query.trim() && results.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No results found.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
