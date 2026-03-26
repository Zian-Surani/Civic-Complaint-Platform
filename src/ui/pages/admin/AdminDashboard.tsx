import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../integrations/supabase/client";
import { PremiumLayout, adminNavItems } from "../../components/layouts/PremiumLayout";
import { StatCard } from "../../components/ui/stat-card";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from "../../components/ui/premium-card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { SeverityBadge } from "../../components/badges/PremiumBadges";
import { ComplaintsTrendChart } from "../../components/analytics/ComplaintsTrendChart";
import { CategoryBarChart } from "../../components/analytics/CategoryBarChart";
import { SeverityPieChart } from "../../components/analytics/SeverityPieChart";
import { StatusDistributionChart } from "../../components/analytics/StatusDistributionChart";
import { FileText, Users, MapPin, AlertTriangle, TrendingUp, Clock, ChevronRight, BarChart3 } from "lucide-react";
import { ACTIVE_STATUSES, isActiveStatus, normalizeStatus } from "../../lib/status-utils";
import type { Database } from "../../integrations/supabase/types";

type SeverityLevel = string;

interface WardSummary {
  ward_id: string;
  ward_name: string;
  active_complaints: number;
  critical_count: number;
  sla_breached: number;
}

interface RecentComplaint {
  id: string;
  title: string;
  severity: SeverityLevel;
  wards: { name: string } | null;
  complaint_categories: { name: string } | null;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    activeComplaints: 0,
    totalWards: 0,
    totalAuthorities: 0,
    criticalComplaints: 0,
    slaBreaches: 0,
  });
  const [wardSummaries, setWardSummaries] = useState<WardSummary[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<RecentComplaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const countActiveByWard = async (wardId: string) => {
        const { count, error } = await supabase
          .from("complaints")
          .select("id", { count: "exact" })
          .eq("ward_id", wardId)
          .in("status", ACTIVE_STATUSES as unknown as string[])
          .limit(1);

        if (!error && typeof count === "number" && count > 0) return count;

        const { data } = await supabase
          .from("complaints")
          .select("status")
          .eq("ward_id", wardId);

        if (!data) return 0;
        return data.filter((row: any) => isActiveStatus(normalizeStatus(row.status))).length;
      };

      const countActiveByWardWithFilter = async (
        wardId: string,
        extraFilter: (q: any) => any
      ) => {
        const base = supabase
          .from("complaints")
          .select("id", { count: "exact" })
          .eq("ward_id", wardId)
          .in("status", ACTIVE_STATUSES as unknown as string[]);

        const { count, error } = await extraFilter(base).limit(1);

        if (!error && typeof count === "number" && count > 0) return count;

        const { data } = await extraFilter(
          supabase.from("complaints").select("status").eq("ward_id", wardId)
        );

        if (!data) return 0;
        return data.filter((row: any) => isActiveStatus(normalizeStatus(row.status))).length;
      };

      const [
        { count: totalComplaints },
        { count: activeComplaints },
        { count: totalWards },
        { count: totalAuthorities },
        { count: criticalComplaints },
        { count: slaBreaches },
      ] = await Promise.all([
        supabase.from("complaints").select("id", { count: "exact" }).limit(1),
        supabase.from("complaints").select("id", { count: "exact" }).in("status", ACTIVE_STATUSES as unknown as string[]).limit(1),
        supabase.from("wards").select("id", { count: "exact" }).limit(1),
        supabase.from("users").select("id", { count: "exact" }).eq("role", "local_authority").limit(1),
        supabase.from("complaints").select("id", { count: "exact" }).eq("priority", "critical").in("status", ACTIVE_STATUSES as unknown as string[]).limit(1),
        supabase.from("complaints").select("id", { count: "exact" }).eq("is_sla_breached", true).in("status", ACTIVE_STATUSES as unknown as string[]).limit(1),
      ]);

      let totalComplaintsValue = totalComplaints || 0;
      let activeComplaintsValue = activeComplaints || 0;
      let criticalComplaintsValue = criticalComplaints || 0;
      let slaBreachesValue = slaBreaches || 0;

      if (activeComplaintsValue === 0 || criticalComplaintsValue === 0 || slaBreachesValue === 0 || totalComplaintsValue === 0) {
        const { data: complaintRows } = await supabase
          .from("complaints")
          .select("id, status, priority, is_sla_breached");

        if (complaintRows) {
          if (!totalComplaintsValue) totalComplaintsValue = complaintRows.length;
          activeComplaintsValue = complaintRows.filter((row: any) => isActiveStatus(normalizeStatus(row.status))).length;
          criticalComplaintsValue = complaintRows.filter(
            (row: any) => row.priority === "critical" && isActiveStatus(normalizeStatus(row.status))
          ).length;
          slaBreachesValue = complaintRows.filter(
            (row: any) => row.is_sla_breached && isActiveStatus(normalizeStatus(row.status))
          ).length;
        }
      }

      setStats({
        totalComplaints: totalComplaintsValue,
        activeComplaints: activeComplaintsValue,
        totalWards: totalWards || 0,
        totalAuthorities: totalAuthorities || 0,
        criticalComplaints: criticalComplaintsValue,
        slaBreaches: slaBreachesValue,
      });

      const { data: wards } = await supabase.from("wards").select("id, name");

      if (wards) {
        const summaries = await Promise.all(
          wards.map(async (ward) => {
            const [active, critical, breached] = await Promise.all([
              countActiveByWard(ward.id),
              countActiveByWardWithFilter(ward.id, (q) => q.eq("priority", "critical")),
              countActiveByWardWithFilter(ward.id, (q) => q.eq("is_sla_breached", true)),
            ]);
            return { ward_id: ward.id, ward_name: ward.name, active_complaints: active || 0, critical_count: critical || 0, sla_breached: breached || 0 };
          })
        );
        setWardSummaries(summaries.sort((a, b) => b.active_complaints - a.active_complaints));
      }

      const { data: recent } = await supabase
        .from("complaints")
        .select(`id, title, priority, complaint_categories (name), wards (name)`)
        .in("priority", ["critical", "high"])
        .in("status", ACTIVE_STATUSES as unknown as string[])
        .order("created_at", { ascending: false })
        .limit(5);

      if (recent) {
        setRecentComplaints(
          recent.map((c: any) => ({
            ...c,
            severity: c.priority,
          }))
        );
      }
      setLoading(false);
    };

    fetchData();

    const channel = supabase
      .channel("admin-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <PremiumLayout navItems={adminNavItems} title="System Overview">
      <div className="space-y-8">
        {/* Welcome section */}
        <div className="fade-in">
          <h2 className="text-2xl font-semibold tracking-tight">System Overview</h2>
          <p className="text-muted-foreground mt-1">Central administration dashboard for the Civic Complaint Management System</p>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 slide-up" style={{ animationDelay: "100ms" }}>
          <StatCard title="Total Complaints" value={stats.totalComplaints} icon={FileText} />
          <StatCard title="Active" value={stats.activeComplaints} icon={TrendingUp} variant="primary" />
          <StatCard title="Critical" value={stats.criticalComplaints} icon={AlertTriangle} variant="danger" />
          <StatCard title="SLA Breached" value={stats.slaBreaches} icon={Clock} variant="warning" />
          <StatCard title="Wards" value={stats.totalWards} icon={MapPin} />
          <StatCard title="Authorities" value={stats.totalAuthorities} icon={Users} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Ward summaries */}
          <PremiumCard className="slide-up" style={{ animationDelay: "200ms" }}>
            <PremiumCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <PremiumCardTitle>Ward Status</PremiumCardTitle>
                  <PremiumCardDescription>Active complaints by ward</PremiumCardDescription>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </PremiumCardHeader>
            <PremiumCardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => <div key={i} className="shimmer h-12 rounded-xl" />)}
                </div>
              ) : wardSummaries.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No wards configured</p>
              ) : (
                <div className="space-y-2">
                  {wardSummaries.slice(0, 6).map((ward, index) => (
                    <div key={ward.ward_id} className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-muted/50 fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{ward.ward_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-lg bg-muted/50 border-0">{ward.active_complaints} active</Badge>
                        {ward.critical_count > 0 && <Badge className="rounded-lg bg-[hsl(var(--severity-critical))] text-white border-0">{ward.critical_count}</Badge>}
                        {ward.sla_breached > 0 && <Badge className="rounded-lg bg-[hsl(var(--severity-high))] text-white border-0">{ward.sla_breached}</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </PremiumCardContent>
          </PremiumCard>

          {/* Critical complaints */}
          <PremiumCard className="slide-up" style={{ animationDelay: "300ms" }}>
            <PremiumCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <PremiumCardTitle>High Priority</PremiumCardTitle>
                  <PremiumCardDescription>Critical and high severity issues</PremiumCardDescription>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--severity-critical-bg))]">
                  <AlertTriangle className="h-4 w-4 text-[hsl(var(--severity-critical))]" />
                </div>
              </div>
            </PremiumCardHeader>
            <PremiumCardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => <div key={i} className="shimmer h-16 rounded-xl" />)}
                </div>
              ) : recentComplaints.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No critical complaints</p>
              ) : (
                <div className="space-y-2">
                  {recentComplaints.map((complaint, index) => (
                    <div key={complaint.id} className="group flex items-center justify-between rounded-xl border border-border/50 p-3 transition-all duration-200 hover:bg-muted/50 cursor-pointer fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{complaint.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{complaint.wards?.name} • {complaint.complaint_categories?.name}</p>
                      </div>
                      <SeverityBadge severity={complaint.severity} size="sm" />
                    </div>
                  ))}
                  <div className="pt-4 text-center">
                    <Button asChild variant="ghost" className="rounded-xl">
                      <Link to="/admin/complaints">View all<ChevronRight className="ml-1 h-4 w-4" /></Link>
                    </Button>
                  </div>
                </div>
              )}
            </PremiumCardContent>
          </PremiumCard>
        </div>

        {/* Analytics Charts */}
        <div className="grid gap-6 lg:grid-cols-2 slide-up" style={{ animationDelay: "400ms" }}>
          <ComplaintsTrendChart />
          <CategoryBarChart />
        </div>

        <div className="grid gap-6 lg:grid-cols-2 slide-up" style={{ animationDelay: "500ms" }}>
          <StatusDistributionChart />
          <SeverityPieChart />
        </div>
      </div>
    </PremiumLayout>
  );
}

