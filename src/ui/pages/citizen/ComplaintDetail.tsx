import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../integrations/supabase/client";
import { PremiumLayout, citizenNavItems } from "../../components/layouts/PremiumLayout";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from "../../components/ui/premium-card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { SeverityBadge, StatusBadge } from "../../components/badges/PremiumBadges";
import { ActivityTimeline } from "../../components/complaints/ActivityTimeline";
import { ArrowLeft, MapPin, Tag, Calendar, Clock, AlertTriangle, CheckCircle2, FileText, MessageSquare } from "lucide-react";
import type { Database } from "../../integrations/supabase/types";
import { normalizeStatus } from "../../lib/status-utils";

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
  resolution_notes: string | null;
  created_at: string;
  resolved_at: string | null;
  category_name?: string;
  ward_name?: string;
}

const statusSteps: { status: "Raised" | "Assigned" | "In_Progress" | "Resolved" | "Closed"; label: string; icon: typeof FileText }[] = [
  { status: "Raised", label: "Submitted", icon: FileText },
  { status: "Assigned", label: "Assigned", icon: Clock },
  { status: "In_Progress", label: "In Progress", icon: AlertTriangle },
  { status: "Resolved", label: "Resolved", icon: CheckCircle2 },
  { status: "Closed", label: "Closed", icon: CheckCircle2 },
];

export default function ComplaintDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;

    const fetchComplaint = async () => {
      const { data } = await supabase
        .from("complaints")
        .select(`*, complaint_categories (name), wards (name)`)
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (data) {
        setComplaint({
          ...data,
          severity: (data as any).priority,
          category_name: data.complaint_categories?.name,
          ward_name: data.wards?.name,
        });
      }
      setLoading(false);
    };

    fetchComplaint();

    const channel = supabase
      .channel(`complaint-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "complaints", filter: `id=eq.${id}` }, () => fetchComplaint())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, user]);

  const getCurrentStep = () => {
    if (!complaint) return 0;
  const normalized = normalizeStatus(complaint.status);
  return statusSteps.findIndex((s) => s.status === normalized);
  };

  if (loading) {
    return (
      <PremiumLayout navItems={citizenNavItems} title="Complaint Details">
        <div className="space-y-6">
          <div className="shimmer h-8 w-48 rounded-xl" />
          <div className="shimmer h-64 rounded-xl" />
          <div className="shimmer h-32 rounded-xl" />
        </div>
      </PremiumLayout>
    );
  }

  if (!complaint) {
    return (
      <PremiumLayout navItems={citizenNavItems} title="Complaint Details">
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground mb-4">Complaint not found</p>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/citizen/complaints">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Complaints
            </Link>
          </Button>
        </div>
      </PremiumLayout>
    );
  }

  const currentStep = getCurrentStep();

  return (
    <PremiumLayout navItems={citizenNavItems} title="Complaint Details">
      <div className="space-y-6">
        <div className="flex items-center gap-4 fade-in">
          <Button asChild variant="ghost" size="icon" className="rounded-xl">
            <Link to="/citizen/complaints">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold tracking-tight">{complaint.title}</h2>
            <p className="text-muted-foreground mt-1">
              Submitted on {new Date(complaint.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SeverityBadge severity={complaint.severity} />
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        {/* Status Timeline */}
        <PremiumCard className="slide-up" style={{ animationDelay: "100ms" }}>
          <PremiumCardHeader>
            <PremiumCardTitle>Complaint Status</PremiumCardTitle>
            <PremiumCardDescription>Track the progress of your complaint</PremiumCardDescription>
          </PremiumCardHeader>
          <PremiumCardContent>
            <div className="flex items-center justify-between">
              {statusSteps.slice(0, 4).map((step, index) => {
                const isComplete = index <= currentStep;
                const isCurrent = index === currentStep;
                const Icon = step.icon;

                return (
                  <div key={step.status} className="flex flex-col items-center flex-1 relative">
                    {index > 0 && (
                      <div className={`absolute left-0 right-1/2 top-5 h-0.5 -translate-x-1/2 ${index <= currentStep ? "bg-primary" : "bg-border"}`} />
                    )}
                    {index < 3 && (
                      <div className={`absolute left-1/2 right-0 top-5 h-0.5 translate-x-1/2 ${index < currentStep ? "bg-primary" : "bg-border"}`} />
                    )}
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isCurrent ? 1.1 : 1,
                        backgroundColor: isComplete ? "hsl(var(--primary))" : "hsl(var(--muted))",
                      }}
                      className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                    >
                      <Icon className={`h-5 w-5 ${isComplete ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    </motion.div>
                    <span className={`mt-2 text-xs font-medium ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </PremiumCardContent>
        </PremiumCard>

        {/* Complaint Details */}
        <div className="grid gap-6 lg:grid-cols-2">
          <PremiumCard className="slide-up" style={{ animationDelay: "200ms" }}>
            <PremiumCardHeader>
              <PremiumCardTitle>Details</PremiumCardTitle>
            </PremiumCardHeader>
            <PremiumCardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</label>
                <p className="mt-1">{complaint.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Location
                  </label>
                  <p className="mt-1">{complaint.location_details || "—"}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Category
                  </label>
                  <p className="mt-1">{complaint.category_name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ward</label>
                  <p className="mt-1">{complaint.ward_name}</p>
                </div>
              </div>
              {complaint.sla_deadline && (
                <div className={`p-3 rounded-xl ${complaint.is_sla_breached ? "bg-[hsl(var(--severity-critical-bg))]" : "bg-muted"}`}>
                  <div className="flex items-center gap-2">
                    <Clock className={`h-4 w-4 ${complaint.is_sla_breached ? "text-[hsl(var(--severity-critical))]" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">
                      SLA Deadline: {new Date(complaint.sla_deadline).toLocaleString()}
                    </span>
                    {complaint.is_sla_breached && (
                      <Badge className="bg-[hsl(var(--severity-critical))] text-white border-0">Breached</Badge>
                    )}
                  </div>
                </div>
              )}
            </PremiumCardContent>
          </PremiumCard>

          {/* Resolution / Updates */}
          <PremiumCard className="slide-up" style={{ animationDelay: "300ms" }}>
            <PremiumCardHeader>
              <PremiumCardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Activity & Updates
              </PremiumCardTitle>
              <PremiumCardDescription>
                Status changes, responses, and resolution notes
              </PremiumCardDescription>
            </PremiumCardHeader>
            <PremiumCardContent>
              {complaint.resolution_notes && (
                <div className="mb-4 p-4 rounded-xl bg-[hsl(var(--severity-very-low-bg))] border border-[hsl(var(--severity-very-low))]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-[hsl(var(--severity-very-low))]" />
                    <span className="font-medium text-sm">Resolution Notes</span>
                  </div>
                  <p className="text-sm">{complaint.resolution_notes}</p>
                  {complaint.resolved_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Resolved on {new Date(complaint.resolved_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
              <ActivityTimeline complaintId={complaint.id} />
            </PremiumCardContent>
          </PremiumCard>
        </div>
      </div>
    </PremiumLayout>
  );
}


