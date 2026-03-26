import { useEffect, useState } from "react";
import { supabase } from "../../integrations/supabase/client";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from "../ui/premium-card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { AlertTriangle } from "lucide-react";

interface SeverityData {
  name: string;
  value: number;
  color: string;
}

const severityConfig: Record<string, { label: string; color: string }> = {
  critical: { label: "Critical", color: "hsl(var(--severity-critical))" },
  high: { label: "High", color: "hsl(var(--severity-high))" },
  medium: { label: "Medium", color: "hsl(var(--severity-medium))" },
  low: { label: "Low", color: "hsl(var(--severity-low))" },
  very_low: { label: "Very Low", color: "hsl(var(--severity-very-low))" },
};

export function SeverityPieChart() {
  const [data, setData] = useState<SeverityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchSeverityData = async () => {
    const severities: Array<"critical" | "high" | "medium" | "low" | "very_low"> = ["critical", "high", "medium", "low", "very_low"];
    
    const severityCounts = await Promise.all(
      severities.map(async (severity) => {
        const { count } = await supabase
          .from("complaints")
          .select("*", { count: "exact", head: true })
          .eq("priority", severity);

        return {
          name: severityConfig[severity].label,
          value: count || 0,
          color: severityConfig[severity].color,
        };
      })
    );

    const totalCount = severityCounts.reduce((sum, s) => sum + s.value, 0);
    setTotal(totalCount);
    setData(severityCounts.filter((s) => s.value > 0));
    setLoading(false);
  };

  useEffect(() => {
    fetchSeverityData();

    // Real-time subscription for updates
    const channel = supabase
      .channel("severity-chart-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, () => fetchSeverityData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const chartConfig = Object.fromEntries(
    Object.entries(severityConfig).map(([key, value]) => [
      key,
      { label: value.label, color: value.color },
    ])
  );

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
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
            <PremiumCardTitle>Severity Distribution</PremiumCardTitle>
            <PremiumCardDescription>Breakdown by severity level</PremiumCardDescription>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--severity-critical-bg))]">
            <AlertTriangle className="h-4 w-4 text-[hsl(var(--severity-critical))]" />
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
