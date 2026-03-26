import { useEffect, useState } from "react";
import { supabase } from "../../integrations/supabase/client";
import { PremiumLayout, adminNavItems } from "../../components/layouts/PremiumLayout";
import { StatCard } from "../../components/ui/stat-card";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from "../../components/ui/premium-card";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { WardMap } from "../../components/analytics/WardMap";
import { ComplaintsTrendChart } from "../../components/analytics/ComplaintsTrendChart";
import { CategoryBarChart } from "../../components/analytics/CategoryBarChart";
import { SeverityPieChart } from "../../components/analytics/SeverityPieChart";
import { WardIntelligenceTable } from "../../components/analytics/WardIntelligenceTable";
import { AuthorityRankingTable } from "../../components/analytics/AuthorityRankingTable";
import { FileText, TrendingUp, AlertTriangle, Clock, CheckCircle2, BarChart3, Map, Users } from "lucide-react";
import { ACTIVE_STATUSES, RESOLVED_STATUSES } from "../../lib/status-utils";

interface GlobalStats {
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  slaBreachPercentage: number;
  avgResolutionHours: number;
  criticalCount: number;
}

export default function AdminAnalytics() {
  const [stats, setStats] = useState<GlobalStats>({
    totalComplaints: 0,
    resolvedComplaints: 0,
    pendingComplaints: 0,
    slaBreachPercentage: 0,
    avgResolutionHours: 0,
    criticalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchGlobalStats = async () => {
      const [
        { count: total },
        { count: resolved },
        { count: pending },
        { count: breached },
        { count: critical },
      ] = await Promise.all([
        supabase.from("complaints").select("id", { count: "exact" }).limit(1),
        supabase.from("complaints").select("id", { count: "exact" }).in("status", RESOLVED_STATUSES as unknown as string[]).limit(1),
        supabase.from("complaints").select("id", { count: "exact" }).in("status", ACTIVE_STATUSES as unknown as string[]).limit(1),
        supabase.from("complaints").select("id", { count: "exact" }).eq("is_sla_breached", true).limit(1),
        supabase.from("complaints").select("id", { count: "exact" }).eq("priority", "critical").in("status", ACTIVE_STATUSES as unknown as string[]).limit(1),
      ]);

      const totalCount = total || 0;
      const breachedCount = breached || 0;

      setStats({
        totalComplaints: totalCount,
        resolvedComplaints: resolved || 0,
        pendingComplaints: pending || 0,
        slaBreachPercentage: totalCount > 0 ? Math.round((breachedCount / totalCount) * 100) : 0,
        avgResolutionHours: 0, // Will be calculated from daily_ward_stats
        criticalCount: critical || 0,
      });
      setLoading(false);
    };

    fetchGlobalStats();

    const channel = supabase
      .channel("analytics-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, () => fetchGlobalStats())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <PremiumLayout navItems={adminNavItems} title="Analytics">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between fade-in">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Analytics Dashboard</h2>
            <p className="text-muted-foreground mt-1">Data-driven governance insights and performance metrics</p>
          </div>
        </div>

        {/* Global Overview Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 slide-up" style={{ animationDelay: "100ms" }}>
          <StatCard title="Total Complaints" value={stats.totalComplaints} icon={FileText} />
          <StatCard title="Resolved" value={stats.resolvedComplaints} icon={CheckCircle2} variant="success" />
          <StatCard title="Raised" value={stats.pendingComplaints} icon={Clock} variant="warning" />
          <StatCard title="Critical Active" value={stats.criticalCount} icon={AlertTriangle} variant="danger" />
          <StatCard 
            title="SLA Breach %" 
            value={`${stats.slaBreachPercentage}%`} 
            icon={TrendingUp} 
            variant={stats.slaBreachPercentage > 20 ? "danger" : stats.slaBreachPercentage > 10 ? "warning" : "success"} 
          />
          <StatCard title="Resolution Rate" value={stats.totalComplaints > 0 ? `${Math.round((stats.resolvedComplaints / stats.totalComplaints) * 100)}%` : "0%"} icon={BarChart3} variant="primary" />
        </div>

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="slide-up" style={{ animationDelay: "200ms" }}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid rounded-xl bg-muted p-1">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-soft-sm">
              <BarChart3 className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-soft-sm">
              <Map className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Map View</span>
            </TabsTrigger>
            <TabsTrigger value="wards" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-soft-sm">
              <FileText className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Wards</span>
            </TabsTrigger>
            <TabsTrigger value="authorities" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-soft-sm">
              <Users className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Authorities</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <ComplaintsTrendChart />
              <CategoryBarChart />
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <SeverityPieChart />
              <div className="lg:col-span-2">
                <WardIntelligenceTable compact />
              </div>
            </div>
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="mt-6">
            <WardMap />
          </TabsContent>

          {/* Wards Tab */}
          <TabsContent value="wards" className="mt-6">
            <WardIntelligenceTable />
          </TabsContent>

          {/* Authorities Tab */}
          <TabsContent value="authorities" className="mt-6">
            <AuthorityRankingTable />
          </TabsContent>
        </Tabs>
      </div>
    </PremiumLayout>
  );
}

