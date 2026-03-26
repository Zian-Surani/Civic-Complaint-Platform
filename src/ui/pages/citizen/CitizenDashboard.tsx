import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../integrations/supabase/client";
import { PremiumLayout, citizenNavItems } from "../../components/layouts/PremiumLayout";
import { StatCard } from "../../components/ui/stat-card";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from "../../components/ui/premium-card";
import { Button } from "../../components/ui/button";
import { SeverityBadge, StatusBadge } from "../../components/badges/PremiumBadges";
import { FileText, Plus, Clock, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import type { Database } from "../../integrations/supabase/types";
import { isActiveStatus, isResolvedStatus } from "../../lib/status-utils";

type SeverityLevel = string;
type ComplaintStatus = string;

interface ComplaintSummary {
  id: string;
  title: string;
  status: ComplaintStatus;
  severity: SeverityLevel;
  created_at: string;
  category_name?: string;
}

export default function CitizenDashboard() {
  const { user, profile } = useAuth();
  const [complaints, setComplaints] = useState<ComplaintSummary[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data: complaintsData, error: complaintsError } = await supabase
        .from("complaints")
        .select(`id, title, status, priority, created_at, complaint_categories (name)`)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (complaintsError) {
        console.error("Citizen dashboard list error:", complaintsError);
      }

      if (complaintsData) {
        setComplaints(
          complaintsData.map((c: any) => ({
            ...c,
            severity: c.priority,
            category_name: c.complaint_categories?.name,
          }))
        );
      }

      let total = 0;
      let pending = 0;
      let resolved = 0;

      const { count: totalCount, error: totalError } = await supabase
        .from("complaints")
        .select("id", { count: "exact" })
        .eq("user_id", user.id)
        .limit(1);

      if (!totalError && typeof totalCount === "number") {
        total = totalCount;
      }

      let { data: statusRows, error: statusError } = await supabase
        .from("complaints")
        .select("id, status")
        .eq("user_id", user.id);

      if (statusError) {
        ({ data: statusRows, error: statusError } = await supabase
          .from("complaints")
          .select("id, status")
          .eq("citizen_id", user.id));
      }

      if (statusRows) {
        if (!total) total = statusRows.length;
        pending = statusRows.filter((row: any) => isActiveStatus(row.status)).length;
        resolved = statusRows.filter((row: any) => isResolvedStatus(row.status)).length;
      }

      const countErrors = [totalError, statusError].filter(Boolean);
      const hasMeaningfulError = countErrors.some((err: any) => {
        if (!err) return false;
        return Boolean(err.message || err.details || err.hint || err.code || err.status);
      });

      if (hasMeaningfulError) {
        // Avoid noisy logging for empty error shells while keeping behavior unchanged
      }

      setStats({ total: total || 0, pending: pending || 0, resolved: resolved || 0 });
      setLoading(false);
    };

    fetchData();

    const channel = supabase
      .channel("citizen-complaints")
      .on("postgres_changes", { event: "*", schema: "public", table: "complaints", filter: `user_id=eq.${user.id}` }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return (
    <PremiumLayout navItems={citizenNavItems} title="Dashboard">
      <div className="space-y-8">
        {/* Welcome section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between fade-in">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Welcome back, {profile?.full_name?.split(" ")[0] || "Citizen"}
            </h2>
            <p className="text-muted-foreground mt-1">Track and manage your civic complaints</p>
          </div>
          <Button asChild className="rounded-xl btn-premium">
            <Link to="/citizen/new">
              <Plus className="mr-2 h-4 w-4" />
              New Complaint
            </Link>
          </Button>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 sm:grid-cols-3 slide-up" style={{ animationDelay: "100ms" }}>
          <StatCard title="Total Complaints" value={stats.total} icon={FileText} variant="primary" />
          <StatCard title="In Progress" value={stats.pending} icon={Clock} variant="warning" />
          <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle2} variant="success" />
        </div>

        {/* Recent complaints */}
        <PremiumCard className="slide-up" style={{ animationDelay: "200ms" }}>
          <PremiumCardHeader>
            <PremiumCardTitle>Recent Complaints</PremiumCardTitle>
            <PremiumCardDescription>Your latest submitted complaints</PremiumCardDescription>
          </PremiumCardHeader>
          <PremiumCardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="shimmer h-20 rounded-xl" />)}
              </div>
            ) : complaints.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
                  <AlertCircle className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="font-medium">No complaints yet</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">Submit your first complaint to get started</p>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to="/citizen/new"><Plus className="mr-2 h-4 w-4" />New Complaint</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {complaints.map((complaint, index) => (
                  <Link
                    key={complaint.id}
                    to={`/citizen/complaints/${complaint.id}`}
                    className="group flex items-center justify-between rounded-xl border border-border/50 p-4 transition-all duration-200 hover:bg-muted/50 hover:shadow-soft-sm cursor-pointer fade-in block"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <p className="font-medium truncate pr-4">{complaint.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="truncate">{complaint.category_name}</span>
                        <span className="text-border">•</span>
                        <span className="whitespace-nowrap">{new Date(complaint.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={complaint.severity} size="sm" />
                      <StatusBadge status={complaint.status} size="sm" />
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </Link>
                ))}
                <div className="pt-4 text-center">
                  <Button asChild variant="ghost" className="rounded-xl">
                    <Link to="/citizen/complaints">View all complaints<ChevronRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
                </div>
              </div>
            )}
          </PremiumCardContent>
        </PremiumCard>
      </div>
    </PremiumLayout>
  );
}


