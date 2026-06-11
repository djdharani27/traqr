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
  subject: string;
  color?: string;
}

const subjectColors: Record<string, string> = {
  Math: "#3b82f6",
  Reasoning: "#10b981",
  GK: "#f59e0b",
  English: "#8b5cf6",
  Overall: "#ef4444",
};

export function SubjectProgressChart({
  data,
  subject,
  color,
}: ProgressChartProps) {
  const lineColor = color ?? subjectColors[subject] ?? "#3b82f6";

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        No data yet for {subject}
      </div>
    );
  }

  return (
    <div className="h-64">
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
            formatter={(value: unknown) => [`${value}%`, subject]}
          />
          <Line
            type="monotone"
            dataKey="percentage"
            stroke={lineColor}
            strokeWidth={2}
            dot={{ r: 4, fill: lineColor }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
