import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../integrations/supabase/client";
import { PremiumLayout, authorityNavItems } from "../../components/layouts/PremiumLayout";
import { StatCard } from "../../components/ui/stat-card";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from "../../components/ui/premium-card";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { MapPin, FileText, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { ACTIVE_STATUSES, RESOLVED_STATUSES } from "../../lib/status-utils";

interface WardStats {
  id: string;
  name: string;
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  criticalCount: number;
  slaBreached: number;
}

export default function AuthorityWards() {
  const { user, profile } = useAuth();
  const [wardStats, setWardStats] = useState<WardStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ complaints: 0, pending: 0, resolved: 0, critical: 0 });

  useEffect(() => {
    if (!user) return;

    const fetchWardStats = async () => {
      if (!profile?.authority_id) {
        setLoading(false);
        setWardStats([]);
        setTotals({ complaints: 0, pending: 0, resolved: 0, critical: 0 });
        return;
      }

      const { data: wardsData } = await supabase
        .from("wards")
        .select("id, name")
        .eq("authority_id", profile.authority_id);

      if (!wardsData || wardsData.length === 0) {
        setLoading(false);
        return;
      }

      const stats = await Promise.all(
        wardsData.map(async (ward) => {
          if (!ward) return null;

          const [
            { count: total },
            { count: pending },
            { count: resolved },
            { count: critical },
            { count: breached },
          ] = await Promise.all([
            supabase.from("complaints").select("id", { count: "exact" }).eq("ward_id", ward.id).limit(1),
            supabase.from("complaints").select("id", { count: "exact" }).eq("ward_id", ward.id).in("status", ACTIVE_STATUSES as unknown as string[]).limit(1),
            supabase.from("complaints").select("id", { count: "exact" }).eq("ward_id", ward.id).in("status", RESOLVED_STATUSES as unknown as string[]).limit(1),
            supabase.from("complaints").select("id", { count: "exact" }).eq("ward_id", ward.id).eq("priority", "critical").in("status", ACTIVE_STATUSES as unknown as string[]).limit(1),
            supabase.from("complaints").select("id", { count: "exact" }).eq("ward_id", ward.id).eq("is_sla_breached", true).in("status", ACTIVE_STATUSES as unknown as string[]).limit(1),
          ]);

          return {
            id: ward.id,
            name: ward.name,
            totalComplaints: total || 0,
            pendingComplaints: pending || 0,
            resolvedComplaints: resolved || 0,
            criticalCount: critical || 0,
            slaBreached: breached || 0,
          };
        })
      );

      const validStats = stats.filter((s): s is WardStats => s !== null);
      setWardStats(validStats);

      // Calculate totals
      const totalComplaints = validStats.reduce((sum, w) => sum + w.totalComplaints, 0);
      const totalPending = validStats.reduce((sum, w) => sum + w.pendingComplaints, 0);
      const totalResolved = validStats.reduce((sum, w) => sum + w.resolvedComplaints, 0);
      const totalCritical = validStats.reduce((sum, w) => sum + w.criticalCount, 0);
      setTotals({ complaints: totalComplaints, pending: totalPending, resolved: totalResolved, critical: totalCritical });

      setLoading(false);
    };

    fetchWardStats();

    const channel = supabase
      .channel("authority-wards-stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, () => fetchWardStats())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, profile?.authority_id]);

  return (
    <PremiumLayout navItems={authorityNavItems} title="My Wards">
      <div className="space-y-8">
        <div className="fade-in">
          <h2 className="text-2xl font-semibold tracking-tight">My Assigned Wards</h2>
          <p className="text-muted-foreground mt-1">Overview of complaints and performance across your wards</p>
        </div>

        {/* Aggregate Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 slide-up">
          <StatCard title="Total Complaints" value={totals.complaints} icon={FileText} />
          <StatCard title="Raised" value={totals.pending} icon={Clock} variant="warning" />
          <StatCard title="Resolved" value={totals.resolved} icon={CheckCircle2} variant="success" />
          <StatCard title="Critical Active" value={totals.critical} icon={AlertTriangle} variant="danger" />
        </div>

        {/* Ward Cards */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => <div key={i} className="shimmer h-64 rounded-xl" />)}
          </div>
        ) : wardStats.length === 0 ? (
          <PremiumCard>
            <PremiumCardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
                <MapPin className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="font-medium">No wards assigned</h3>
              <p className="text-sm text-muted-foreground mt-1">Contact your administrator for ward assignments</p>
            </PremiumCardContent>
          </PremiumCard>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 slide-up" style={{ animationDelay: "100ms" }}>
            {wardStats.map((ward, index) => {
              const resolutionRate = ward.totalComplaints > 0 
                ? Math.round((ward.resolvedComplaints / ward.totalComplaints) * 100)
                : 0;

              return (
                <PremiumCard 
                  key={ward.id} 
                  className="fade-in transition-all duration-200 hover:shadow-soft-lg"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <PremiumCardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <PremiumCardTitle className="text-base">{ward.name}</PremiumCardTitle>
                        </div>
                      </div>
                      {ward.criticalCount > 0 && (
                        <Badge className="rounded-lg bg-[hsl(var(--severity-critical))] text-white border-0">
                          {ward.criticalCount} critical
                        </Badge>
                      )}
                    </div>
                  </PremiumCardHeader>
                  <PremiumCardContent className="space-y-4">
                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-2xl font-semibold">{ward.totalComplaints}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-2xl font-semibold text-[hsl(var(--severity-high))]">{ward.pendingComplaints}</p>
                        <p className="text-xs text-muted-foreground">Pending</p>
                      </div>
                    </div>

                    {/* Resolution progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Resolution Rate</span>
                        <span className="font-medium">{resolutionRate}%</span>
                      </div>
                      <Progress value={resolutionRate} className="h-2" />
                    </div>

                    {/* SLA breaches indicator */}
                    {ward.slaBreached > 0 && (
                      <div className="flex items-center gap-2 text-sm text-[hsl(var(--severity-high))]">
                        <Clock className="h-4 w-4" />
                        <span>{ward.slaBreached} SLA breaches</span>
                      </div>
                    )}

                  </PremiumCardContent>
                </PremiumCard>
              );
            })}
          </div>
        )}
      </div>
    </PremiumLayout>
  );
}

