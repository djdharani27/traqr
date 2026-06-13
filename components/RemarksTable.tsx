"use client";

import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { MessageSquareText, ClipboardList, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import type { Subject } from "@/types";
import { deleteSelectedRemarksAction } from "@/lib/actions";

const SUBJECTS: Subject[] = ["Math", "Reasoning", "GK", "English"];

export interface RemarkEntry {
  date: string;
  source: "test" | "study";
  content: string;
  subject?: string;
  platform?: string;
  testId?: string;
  remarkIndex?: number;
  isTestRemark?: boolean;
}

interface RemarksTableProps {
  allRemarks: RemarkEntry[];
}

type SourceFilter = "all" | "test" | "study";
type SortOrder = "newest" | "oldest";

export function RemarksTable({ allRemarks }: RemarksTableProps) {
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const filtered = useMemo(() => {
    let remarks = [...allRemarks];

    if (sourceFilter !== "all") {
      remarks = remarks.filter((r) => r.source === sourceFilter);
    }

    if (sourceFilter === "test" && subjectFilter !== "all") {
      remarks = remarks.filter((r) => r.subject === subjectFilter);
    }

    remarks.sort((a, b) =>
      sortOrder === "newest"
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date)
    );

    return remarks;
  }, [allRemarks, sourceFilter, subjectFilter, sortOrder]);

  const allSelected =
    filtered.length > 0 && filtered.every((_, i) => selected.has(i));
  const someSelected = filtered.some((_, i) => selected.has(i));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((_, i) => i)));
    }
  };

  const toggleOne = (i: number) => {
    const next = new Set(selected);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setSelected(next);
  };

  const handleDeleteSelected = async () => {
    const selectedRemarks = filtered
      .map((remark, i) => (selected.has(i) ? remark : null))
      .filter((r): r is RemarkEntry => r !== null);

    if (selectedRemarks.length === 0) return;

    if (confirm(`Delete ${selectedRemarks.length} selected remark(s)?`)) {
      await deleteSelectedRemarksAction(selectedRemarks);
      setSelected(new Set());
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Source:</span>
          <Select
            value={sourceFilter}
            onValueChange={(v) => {
              setSourceFilter(v as SourceFilter);
              setSubjectFilter("all");
              setSelected(new Set());
            }}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="test">Test</SelectItem>
              <SelectItem value="study">Study</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {sourceFilter === "test" && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Subject:</span>
            <Select
              value={subjectFilter}
              onValueChange={(v) => {
                setSubjectFilter(v);
                setSelected(new Set());
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort:</span>
          <Select
            value={sortOrder}
            onValueChange={(v) => setSortOrder(v as SortOrder)}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selected.size > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSelected}
            className="gap-1"
          >
            <Trash2 className="size-4" />
            Delete ({selected.size})
          </Button>
        )}

        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} remark{filtered.length !== 1 ? "s" : ""}
          {selected.size > 0 && ` · ${selected.size} selected`}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No remarks match the current filters.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Remark</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((remark, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Checkbox
                    checked={selected.has(i)}
                    onCheckedChange={() => toggleOne(i)}
                    aria-label={`Select remark ${i + 1}`}
                  />
                </TableCell>
                <TableCell className="font-medium whitespace-nowrap">
                  <Link
                    href={`/day/${remark.date}`}
                    className="hover:underline"
                  >
                    {format(parseISO(remark.date), "MMM d, yyyy")}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={remark.source === "test" ? "default" : "secondary"}
                  >
                    {remark.source === "test" ? (
                      <ClipboardList className="size-3 mr-1" />
                    ) : (
                      <MessageSquareText className="size-3 mr-1" />
                    )}
                    {remark.source}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {remark.source === "test" && remark.subject && (
                    <>
                      {remark.subject}
                      {remark.platform && ` — ${remark.platform}`}
                    </>
                  )}
                  {remark.source === "study" && "Study day note"}
                </TableCell>
                <TableCell className="text-sm max-w-md">
                  {remark.content}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
