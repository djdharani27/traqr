import { getTests } from "@/lib/services";
import { TestHistoryTable } from "@/components/TestHistoryTable";
import { TestForm } from "@/components/TestForm";
import { format } from "date-fns";

export default async function TestsPage() {
  const tests = await getTests("default-user");
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tests</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tests.length} test{tests.length !== 1 ? "s" : ""} recorded
          </p>
        </div>
        <TestForm defaultDate={today} />
      </div>
      <TestHistoryTable tests={tests} />
    </div>
  );
}
