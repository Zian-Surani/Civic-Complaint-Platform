import { useEffect, useState } from "react";
import { supabase } from "../../integrations/supabase/client";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from "../ui/premium-card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { BarChart3 } from "lucide-react";

interface CategoryData {
  name: string;
  count: number;
  color: string;
}

const categoryColors = [
  "hsl(var(--primary))",
  "hsl(var(--severity-high))",
  "hsl(var(--severity-medium))",
  "hsl(var(--severity-low))",
  "hsl(var(--severity-very-low))",
  "hsl(270, 67%, 47%)",
  "hsl(340, 65%, 47%)",
  "hsl(180, 65%, 40%)",
];

export function CategoryBarChart() {
  const [data, setData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategoryData = async () => {
    // Get categories
    const { data: categories } = await supabase
      .from("complaint_categories")
      .select("id, name");

    if (categories) {
      const categoryStats = await Promise.all(
        categories.map(async (cat, index) => {
          const { count } = await supabase
            .from("complaints")
            .select("*", { count: "exact", head: true })
            .eq("category_id", cat.id);

          return {
            name: cat.name.length > 15 ? cat.name.substring(0, 15) + "..." : cat.name,
            fullName: cat.name,
            count: count || 0,
            color: categoryColors[index % categoryColors.length],
          };
        })
      );

      setData(categoryStats.sort((a, b) => b.count - a.count));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategoryData();

    // Real-time subscription for updates
    const channel = supabase
      .channel("category-chart-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, () => fetchCategoryData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const chartConfig = {
    count: {
      label: "Complaints",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <PremiumCard>
      <PremiumCardHeader>
        <div className="flex items-center justify-between">
          <div>
            <PremiumCardTitle>Complaints by Category</PremiumCardTitle>
            <PremiumCardDescription>Distribution across complaint categories</PremiumCardDescription>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--severity-high-bg))]">
            <BarChart3 className="h-4 w-4 text-[hsl(var(--severity-high))]" />
          </div>
        </div>
      </PremiumCardHeader>
      <PremiumCardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No complaint data available</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 11 }} 
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value, name, props) => [value, props.payload.fullName || name]}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </PremiumCardContent>
    </PremiumCard>
  );
}
