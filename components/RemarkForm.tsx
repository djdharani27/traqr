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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addRemarkAction } from "@/lib/actions";
import { format } from "date-fns";
import { MessageSquarePlus, Plus, X } from "lucide-react";

interface RemarkFormProps {
  defaultDate?: string;
  onSuccess?: () => void;
}

export function RemarkForm({ defaultDate, onSuccess }: RemarkFormProps) {
  const [open, setOpen] = useState(false);
  const [remarks, setRemarks] = useState<string[]>([""]);
  const today = format(new Date(), "yyyy-MM-dd");

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <MessageSquarePlus className="size-4" />
          Add Remark
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Remark</DialogTitle>
          <DialogDescription>
            Write notes about your study session or areas to improve.
          </DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            const date = formData.get("date") as string;
            await addRemarkAction(date, formData);
            setOpen(false);
            setRemarks([""]);
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
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Remarks</Label>
            {remarks.map((r, i) => (
              <div key={i} className="flex gap-2">
                <Textarea
                  name={i === 0 ? "remark" : undefined}
                  placeholder="Need more practice with percentages..."
                  required
                  rows={3}
                  value={r}
                  onChange={(e) => updateRemark(i, e.target.value)}
                />
                {remarks.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => removeRemark(i)}
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            ))}
            {remarks.slice(1).map((r, i) =>
              r.trim() ? (
                <input key={`hidden-${i}`} type="hidden" name="remark" value={r.trim()} />
              ) : null
            )}
            <Button type="button" variant="outline" size="sm" onClick={addRemark}>
              <Plus className="size-3 mr-1" /> Add Remark
            </Button>
          </div>
          <Button type="submit" className="w-full">
            Save Remark
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
