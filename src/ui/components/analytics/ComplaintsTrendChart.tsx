import { useEffect, useState } from "react";
import { supabase } from "../../integrations/supabase/client";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from "../ui/premium-card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp } from "lucide-react";

interface TrendData {
  date: string;
  complaints: number;
  resolved: number;
}

export function ComplaintsTrendChart() {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrendData = async () => {
    // Get complaints grouped by date for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: complaints } = await supabase
      .from("complaints")
      .select("created_at, status, resolved_at")
      .gte("created_at", thirtyDaysAgo.toISOString());

    if (complaints) {
      // Group by date
      const dateMap = new Map<string, { complaints: number; resolved: number }>();
      
      // Initialize last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        dateMap.set(dateStr, { complaints: 0, resolved: 0 });
      }

      complaints.forEach((c) => {
        const createdDate = c.created_at.split("T")[0];
        if (dateMap.has(createdDate)) {
          const current = dateMap.get(createdDate)!;
          current.complaints += 1;
        }

        if (c.resolved_at) {
          const resolvedDate = c.resolved_at.split("T")[0];
          if (dateMap.has(resolvedDate)) {
            const current = dateMap.get(resolvedDate)!;
            current.resolved += 1;
          }
        }
      });

      const trendData = Array.from(dateMap.entries()).map(([date, values]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        complaints: values.complaints,
        resolved: values.resolved,
      }));

      setData(trendData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrendData();

    // Real-time subscription for updates
    const channel = supabase
      .channel("trend-chart-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, () => fetchTrendData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const chartConfig = {
    complaints: {
      label: "New Complaints",
      color: "hsl(var(--primary))",
    },
    resolved: {
      label: "Resolved",
      color: "hsl(var(--severity-very-low))",
    },
  };

  return (
    <PremiumCard>
      <PremiumCardHeader>
        <div className="flex items-center justify-between">
          <div>
            <PremiumCardTitle>Complaint Trends</PremiumCardTitle>
            <PremiumCardDescription>New complaints vs resolved over the last 30 days</PremiumCardDescription>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
        </div>
      </PremiumCardHeader>
      <PremiumCardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="complaintsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--severity-very-low))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--severity-very-low))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11 }} 
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 11 }} 
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="complaints"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#complaintsGradient)"
              />
              <Area
                type="monotone"
                dataKey="resolved"
                stroke="hsl(var(--severity-very-low))"
                strokeWidth={2}
                fill="url(#resolvedGradient)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </PremiumCardContent>
    </PremiumCard>
  );
}
