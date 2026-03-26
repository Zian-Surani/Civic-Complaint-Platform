import { useEffect, useState } from "react";
import { supabase } from "../../integrations/supabase/client";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from "../ui/premium-card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { ClipboardList } from "lucide-react";
type ComplaintStatus = string;

interface StatusData {
  name: string;
  value: number;
  color: string;
}

const statusConfig: Record<ComplaintStatus, { label: string; color: string }> = {
  Raised: { label: "Raised", color: "hsl(var(--severity-medium))" },
  Assigned: { label: "Assigned", color: "hsl(var(--severity-low))" },
  In_Progress: { label: "In Progress", color: "hsl(var(--primary))" },
  Resolved: { label: "Resolved", color: "hsl(var(--severity-very-low))" },
  Closed: { label: "Closed", color: "hsl(var(--muted-foreground))" },
};

export function StatusDistributionChart() {
  const [data, setData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchStatusData = async () => {
    const statuses: ComplaintStatus[] = ["pending", "assigned", "in_progress", "resolved", "closed"];
    
    const statusCounts = await Promise.all(
      statuses.map(async (status) => {
        const { count, error } = await supabase
          .from("complaints")
          .select("id", { count: "exact" })
          .eq("status", status);

        const normalized = status === "pending"
          ? "Raised"
          : status === "assigned"
            ? "Assigned"
            : status === "in_progress"
              ? "In_Progress"
              : status === "resolved"
                ? "Resolved"
                : "Closed";

        return {
          name: statusConfig[normalized].label,
          value: count || 0,
          color: statusConfig[normalized].color,
          _error: error,
        };
      })
    );

    const merged = statusCounts.reduce<Record<string, StatusData>>((acc, item) => {
      if (!acc[item.name]) {
        acc[item.name] = { ...item };
      } else {
        acc[item.name].value += item.value;
      }
      return acc;
    }, {});

    const mergedList = Object.values(merged);
    const totalCount = mergedList.reduce((sum, s) => sum + s.value, 0);
    if (totalCount === 0 && statusCounts.some((s: any) => s._error)) {
      const { data } = await supabase
        .from("complaints")
        .select("status");
      const fallback = (data || []).reduce<Record<string, StatusData>>((acc, row: any) => {
        const raw = row.status;
        const normalized = raw === "pending"
          ? "Raised"
          : raw === "assigned"
            ? "Assigned"
            : raw === "in_progress"
              ? "In_Progress"
              : raw === "resolved"
                ? "Resolved"
                : raw === "closed"
                  ? "Closed"
                  : raw;
        const label = statusConfig[normalized as ComplaintStatus]?.label || String(normalized);
        if (!acc[label]) {
          acc[label] = { name: label, value: 0, color: statusConfig[normalized as ComplaintStatus]?.color || "hsl(var(--muted-foreground))" };
        }
        acc[label].value += 1;
        return acc;
      }, {});
      const list = Object.values(fallback).filter((s) => s.value > 0);
      setTotal(list.reduce((sum, s) => sum + s.value, 0));
      setData(list);
    } else {
      setTotal(totalCount);
      setData(mergedList.filter((s) => s.value > 0));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStatusData();

    // Real-time subscription for updates
    const channel = supabase
      .channel("status-chart-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, () => fetchStatusData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const chartConfig = Object.fromEntries(
    Object.entries(statusConfig).map(([key, value]) => [
      key,
      { label: value.label, color: value.color },
    ])
  );

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <PremiumCard>
      <PremiumCardHeader>
        <div className="flex items-center justify-between">
          <div>
            <PremiumCardTitle>Status Distribution</PremiumCardTitle>
            <PremiumCardDescription>Complaints by current status</PremiumCardDescription>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <ClipboardList className="h-4 w-4 text-primary" />
          </div>
        </div>
      </PremiumCardHeader>
      <PremiumCardContent>
        {loading ? (
          <div className="h-[280px] flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center">
            <p className="text-muted-foreground">No complaint data available</p>
          </div>
        ) : (
          <div className="h-[280px] relative">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  label={CustomLabel}
                  outerRadius={90}
                  innerRadius={45}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="hsl(var(--background))"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            {/* Center total */}
            <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-2xl font-semibold">{total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {data.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </PremiumCardContent>
    </PremiumCard>
  );
}

