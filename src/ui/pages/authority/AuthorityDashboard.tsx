import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../integrations/supabase/client";
import { PremiumLayout, authorityNavItems } from "../../components/layouts/PremiumLayout";
import { StatCard } from "../../components/ui/stat-card";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from "../../components/ui/premium-card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { SeverityBadge, SlaIndicator } from "../../components/badges/PremiumBadges";
import { FileText, AlertTriangle, Clock, CheckCircle2, MapPin, ChevronRight } from "lucide-react";
import type { Database } from "../../integrations/supabase/types";
import { isActiveStatus, isResolvedStatus, normalizeStatus } from "../../lib/status-utils";

type SeverityLevel = string;

interface ComplaintSummary {
  id: string;
  title: string;
  status: string;
  severity: SeverityLevel;
  sla_deadline: string | null;
  is_sla_breached: boolean;
  created_at: string;
  resolved_at?: string | null;
  category_name?: string;
  ward_name?: string;
}

interface WardInfo {
  id: string;
  name: string;
}

export default function AuthorityDashboard() {
  const { user, profile } = useAuth();
  const [complaints, setComplaints] = useState<ComplaintSummary[]>([]);
  const [resolvedComplaints, setResolvedComplaints] = useState<ComplaintSummary[]>([]);
  const [assignedWards, setAssignedWards] = useState<WardInfo[]>([]);
  const [stats, setStats] = useState({ total: 0, critical: 0, slaBreached: 0, resolvedTotal: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const normalizeForCount = (status: unknown) =>
        normalizeStatus(String(status ?? "").trim().replace(/\s+/g, "_"));

      if (!profile?.authority_id) {
        setComplaints([]);
        setResolvedComplaints([]);
        setAssignedWards([]);
        setStats({ total: 0, critical: 0, slaBreached: 0, resolvedTotal: 0 });
        setLoading(false);
        return;
      }

      const { data: wardsData } = await supabase
        .from("wards")
        .select("id, name")
        .eq("authority_id", profile.authority_id);

      const wardIds = (wardsData || []).map((w: any) => w.id);
      if (wardsData && wardsData.length > 0) {
        setAssignedWards(wardsData as WardInfo[]);
      }

      let complaintsQuery = supabase
        .from("complaints")
        .select(`id, title, status, priority, sla_deadline, is_sla_breached, created_at, resolved_at, complaint_categories (name), wards (id, name)`);

      if (wardIds.length > 0) {
        complaintsQuery = complaintsQuery.or(
          `assigned_to.eq.${user.id},ward_id.in.(${wardIds.join(",")})`
        );
      } else {
        complaintsQuery = complaintsQuery.eq("assigned_to", user.id);
      }

      const { data: complaintsData } = await complaintsQuery
        .order("created_at", { ascending: false })
        .limit(200);

      const normalized = complaintsData
        ? complaintsData.map((c: any) => ({
          ...c,
          severity: (c.priority ?? c.severity) as any,
          category_name: c.complaint_categories?.name,
          ward_name: c.wards?.name,
        }))
        : [];

      const activeComplaints = normalized.filter((c) => isActiveStatus(normalizeForCount(c.status)));
      setComplaints(activeComplaints.slice(0, 10));

      const resolvedList = normalized.filter((c) => isResolvedStatus(normalizeForCount(c.status)));
      setResolvedComplaints(resolvedList.slice(0, 10));

      const wardMap = new Map<string, WardInfo>();
      (complaintsData || []).forEach((c: any) => {
        if (c.wards?.id && c.wards?.name) {
          wardMap.set(c.wards.id, { id: c.wards.id, name: c.wards.name });
        }
      });
      if (wardMap.size > 0) {
        setAssignedWards(Array.from(wardMap.values()));
      }

      const activeCount = normalized.filter((c) => isActiveStatus(normalizeForCount(c.status))).length;
      const criticalCount = normalized.filter((c) => isActiveStatus(normalizeForCount(c.status)) && c.priority === "critical").length;
      const breachedCount = normalized.filter((c) => isActiveStatus(normalizeForCount(c.status)) && c.is_sla_breached).length;
      const resolvedTotal = normalized.filter((c) => isResolvedStatus(normalizeForCount(c.status))).length;

      setStats({ total: activeCount || 0, critical: criticalCount || 0, slaBreached: breachedCount || 0, resolvedTotal: resolvedTotal || 0 });
      setLoading(false);
    };

    fetchData();

    const channel = supabase
      .channel("authority-complaints")
      .on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, profile?.authority_id]);

  return (
    <PremiumLayout navItems={authorityNavItems} title="Dashboard">
      <div className="space-y-8">
        {/* Welcome section */}
        <div className="fade-in">
          <h2 className="text-2xl font-semibold tracking-tight">
            Welcome, {profile?.full_name?.split(" ")[0] || "Authority"}
          </h2>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-muted-foreground">Managing</span>
            {assignedWards.length > 0 ? (
              assignedWards.map((ward) => (
                <Badge key={ward.id} variant="outline" className="rounded-lg border-border/50 bg-muted/50">
                  <MapPin className="mr-1 h-3 w-3" />
                  {ward.name}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">No wards assigned</span>
            )}
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 slide-up" style={{ animationDelay: "100ms" }}>
          <StatCard title="Active Complaints" value={stats.total} icon={FileText} variant="primary" />
          <StatCard title="Critical" value={stats.critical} icon={AlertTriangle} variant="danger" />
          <StatCard title="SLA Breached" value={stats.slaBreached} icon={Clock} variant="warning" />
          <StatCard title="Resolved" value={stats.resolvedTotal} icon={CheckCircle2} variant="success" />
        </div>

        {/* Priority complaints */}
        <PremiumCard className="slide-up" style={{ animationDelay: "200ms" }}>
          <PremiumCardHeader>
            <PremiumCardTitle>Priority Complaints</PremiumCardTitle>
            <PremiumCardDescription>Most recent active complaints</PremiumCardDescription>
          </PremiumCardHeader>
          <PremiumCardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="shimmer h-20 rounded-xl" />)}
              </div>
            ) : complaints.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--severity-very-low-bg))] mb-4">
                  <CheckCircle2 className="h-7 w-7 text-[hsl(var(--severity-very-low))]" />
                </div>
                <h3 className="font-medium">All clear!</h3>
                <p className="text-sm text-muted-foreground mt-1">No active complaints in your wards</p>
              </div>
            ) : (
              <div className="space-y-2">
                {complaints.map((complaint, index) => (
                  <Link
                    key={complaint.id}
                    to={`/authority/complaints/${complaint.id}`}
                    className="group flex items-center justify-between rounded-xl border border-border/50 p-4 transition-all duration-200 hover:bg-muted/50 hover:shadow-soft-sm cursor-pointer fade-in block"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <p className="font-medium truncate">{complaint.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{complaint.ward_name}</span>
                        <span className="text-border">•</span>
                        <span>{complaint.category_name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <SlaIndicator deadline={complaint.sla_deadline} breached={complaint.is_sla_breached} />
                      <SeverityBadge severity={complaint.severity} size="sm" />
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </Link>
                ))}
                <div className="pt-4 text-center">
                  <Button asChild variant="ghost" className="rounded-xl">
                    <Link to="/authority/complaints">View all complaints<ChevronRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
                </div>
              </div>
            )}
          </PremiumCardContent>
        </PremiumCard>

        {/* Resolved complaints */}
        <PremiumCard className="slide-up" style={{ animationDelay: "250ms" }}>
          <PremiumCardHeader>
            <PremiumCardTitle>Resolved Complaints</PremiumCardTitle>
            <PremiumCardDescription>Recently resolved in your wards</PremiumCardDescription>
          </PremiumCardHeader>
          <PremiumCardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="shimmer h-20 rounded-xl" />)}
              </div>
            ) : resolvedComplaints.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--severity-very-low-bg))] mb-3">
                  <CheckCircle2 className="h-6 w-6 text-[hsl(var(--severity-very-low))]" />
                </div>
                <h3 className="font-medium">No resolved complaints yet</h3>
                <p className="text-sm text-muted-foreground mt-1">Resolved cases will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {resolvedComplaints.map((complaint, index) => (
                  <Link
                    key={complaint.id}
                    to={`/authority/complaints/${complaint.id}`}
                    className="group flex items-center justify-between rounded-xl border border-border/50 p-4 transition-all duration-200 hover:bg-muted/50 hover:shadow-soft-sm cursor-pointer fade-in block"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <p className="font-medium truncate">{complaint.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{complaint.ward_name}</span>
                        <span className="text-border">â€¢</span>
                        <span>{complaint.category_name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={complaint.severity} size="sm" />
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </PremiumCardContent>
        </PremiumCard>
      </div>
    </PremiumLayout>
  );
}

