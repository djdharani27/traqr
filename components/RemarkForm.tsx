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
import { MessageSquarePlus } from "lucide-react";

interface RemarkFormProps {
  defaultDate?: string;
  onSuccess?: () => void;
}

export function RemarkForm({ defaultDate, onSuccess }: RemarkFormProps) {
  const [open, setOpen] = useState(false);
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <MessageSquarePlus className="size-4" />
          Add Remark
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Remark</DialogTitle>
          <DialogDescription>
            Write a note about your study session or areas to improve.
          </DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            const date = formData.get("date") as string;
            await addRemarkAction(date, formData);
            setOpen(false);
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
            <Label htmlFor="remark">Remark</Label>
            <Textarea
              id="remark"
              name="remark"
              placeholder="Need more practice with percentages..."
              required
              rows={4}
            />
          </div>
          <Button type="submit" className="w-full">
            Save Remark
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
