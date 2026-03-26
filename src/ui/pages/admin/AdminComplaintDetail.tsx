import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../integrations/supabase/client";
import { PremiumLayout, adminNavItems } from "../../components/layouts/PremiumLayout";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from "../../components/ui/premium-card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { SeverityBadge, StatusBadge, SlaIndicator } from "../../components/badges/PremiumBadges";
import { ActivityTimeline } from "../../components/complaints/ActivityTimeline";
import { ArrowLeft, MapPin, Calendar, User, FileText, Clock } from "lucide-react";

type SeverityLevel = string;
type ComplaintStatus = string;

interface ComplaintDetail {
  id: string;
  title: string;
  description: string;
  location_details: string | null;
  status: ComplaintStatus;
  severity: SeverityLevel;
  sla_deadline: string | null;
  is_sla_breached: boolean;
  created_at: string;
  resolved_at: string | null;
  resolution_notes: string | null;
  category_name?: string;
  ward_name?: string;
  citizen_name?: string;
  authority_name?: string;
}

export default function AdminComplaintDetail() {
  const { id } = useParams<{ id: string }>();
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchComplaint = async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          id, title, description, location_details, status, priority,
          sla_deadline, is_sla_breached, created_at, resolved_at,
          complaint_categories (name),
          wards (name),
          user_id,
          assigned_to
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Admin complaint detail fetch error:", {
          message: (error as any)?.message,
          details: (error as any)?.details,
          hint: (error as any)?.hint,
          code: (error as any)?.code,
        });
        setComplaint(null);
        setLoading(false);
        return;
      }

      if (data) {
        // Fetch citizen profile
        const { data: citizenProfile } = await supabase
          .from("users")
          .select("name")
          .eq("id", data.user_id)
          .maybeSingle();

        // Fetch authority profile if assigned
        let authorityName = null;
        if (data.assigned_to) {
          const { data: authorityProfile } = await supabase
            .from("users")
            .select("name")
            .eq("id", data.assigned_to)
            .maybeSingle();
          authorityName = authorityProfile?.name;
        }

        setComplaint({
          ...data,
          severity: (data as any).priority,
          resolution_notes: (data as any).resolution_notes ?? null,
          category_name: data.complaint_categories?.name,
          ward_name: data.wards?.name,
          citizen_name: citizenProfile?.name,
          authority_name: authorityName,
        });
      }
      setLoading(false);
    };

    fetchComplaint();

    const channel = supabase
      .channel(`admin-complaint-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "complaints", filter: `id=eq.${id}` }, () => fetchComplaint())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  if (loading) {
    return (
      <PremiumLayout navItems={adminNavItems} title="Complaint Details">
        <div className="space-y-6">
          <div className="shimmer h-8 w-48 rounded-lg" />
          <div className="shimmer h-64 rounded-xl" />
          <div className="shimmer h-48 rounded-xl" />
        </div>
      </PremiumLayout>
    );
  }

  if (!complaint) {
    return (
      <PremiumLayout navItems={adminNavItems} title="Complaint Details">
        <div className="flex flex-col items-center justify-center py-16">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Complaint not found</h3>
          <Button asChild variant="ghost" className="mt-4">
            <Link to="/admin/complaints">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Complaints
            </Link>
          </Button>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout navItems={adminNavItems} title="Complaint Details">
      <div className="space-y-6">
        {/* Back button and header */}
        <div className="flex items-center gap-4 fade-in">
          <Button asChild variant="ghost" size="icon" className="rounded-xl">
            <Link to="/admin/complaints">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold tracking-tight">{complaint.title}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className="rounded-lg">
                <MapPin className="mr-1 h-3 w-3" />
                {complaint.ward_name}
              </Badge>
              <Badge variant="outline" className="rounded-lg">{complaint.category_name}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SlaIndicator deadline={complaint.sla_deadline} breached={complaint.is_sla_breached} />
            <SeverityBadge severity={complaint.severity} />
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <PremiumCard className="slide-up">
              <PremiumCardHeader>
                <PremiumCardTitle>Description</PremiumCardTitle>
              </PremiumCardHeader>
              <PremiumCardContent>
                <p className="text-muted-foreground leading-relaxed">{complaint.description}</p>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{complaint.location_details || "—"}</span>
                </div>
              </PremiumCardContent>
            </PremiumCard>

            {/* Resolution notes */}
            {complaint.resolution_notes && (
              <PremiumCard className="slide-up" style={{ animationDelay: "100ms" }}>
                <PremiumCardHeader>
                  <PremiumCardTitle>Resolution Notes</PremiumCardTitle>
                </PremiumCardHeader>
                <PremiumCardContent>
                  <p className="text-muted-foreground">{complaint.resolution_notes}</p>
                </PremiumCardContent>
              </PremiumCard>
            )}

            {/* Activity Timeline */}
            <div className="slide-up" style={{ animationDelay: "200ms" }}>
              <ActivityTimeline complaintId={complaint.id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details card */}
            <PremiumCard className="slide-up" style={{ animationDelay: "100ms" }}>
              <PremiumCardHeader>
                <PremiumCardTitle>Details</PremiumCardTitle>
              </PremiumCardHeader>
              <PremiumCardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Priority</span>
                  <Badge variant="outline" className="rounded-lg font-mono">{complaint.severity}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Submitted by</span>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span className="text-sm">{complaint.citizen_name || "Unknown"}</span>
                  </div>
                </div>
                {complaint.authority_name && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Assigned to</span>
                    <span className="text-sm">{complaint.authority_name}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span className="text-sm">{new Date(complaint.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {complaint.sla_deadline && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">SLA Deadline</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-sm">{new Date(complaint.sla_deadline).toLocaleString()}</span>
                    </div>
                  </div>
                )}
                {complaint.resolved_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Resolved</span>
                    <span className="text-sm">{new Date(complaint.resolved_at).toLocaleDateString()}</span>
                  </div>
                )}
              </PremiumCardContent>
            </PremiumCard>
          </div>
        </div>
      </div>
    </PremiumLayout>
  );
}

