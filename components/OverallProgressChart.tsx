"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";

interface ProgressChartProps {
  data: { date: string; percentage: number }[];
}

export function OverallProgressChart({ data }: ProgressChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        No overall mock tests recorded yet
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => format(parseISO(value), "MMM d")}
            stroke="var(--muted-foreground)"
            fontSize={12}
          />
          <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
            }}
            labelFormatter={(value) => format(parseISO(value as string), "MMM d, yyyy")}
            formatter={(value: unknown) => [`${value}%`, "Overall"]}
          />
          <Line
            type="monotone"
            dataKey="percentage"
            stroke="#ef4444"
            strokeWidth={3}
            dot={{ r: 4, fill: "#ef4444" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
