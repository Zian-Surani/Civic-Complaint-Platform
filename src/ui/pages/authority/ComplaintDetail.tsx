import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../integrations/supabase/client";
import { getUserFriendlyError } from "../../lib/error-utils";
import { PremiumLayout, authorityNavItems } from "../../components/layouts/PremiumLayout";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from "../../components/ui/premium-card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { SeverityBadge, StatusBadge, SlaIndicator } from "../../components/badges/PremiumBadges";
import { ActivityTimeline } from "../../components/complaints/ActivityTimeline";
import { useToast } from "../../hooks/use-toast";
import { ArrowLeft, MapPin, Tag, Calendar, Clock, User, CheckCircle2, Loader2, Send, AlertTriangle, MessageSquare, Shield } from "lucide-react";
import { isActiveStatus, normalizeStatus, toDbStatus } from "../../lib/status-utils";
import type { Database } from "../../integrations/supabase/types";

// Helper to mask sensitive address for authorities (privacy protection)
function maskAddress(address: string): string {
  if (!address) return "Location withheld";
  // Show only first 15 chars + ward area indicator
  const masked = address.substring(0, 15);
  return `${masked}... (Ward Area)`;
}

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
  citizen_name?: string;
  assigned_to?: string | null;
  assigned_authority_id?: string | null;
}

export default function AuthorityComplaintDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<ComplaintStatus | "">("");
  const [resolutionNotes, setResolutionNotes] = useState("");

  useEffect(() => {
    if (!id || !user) return;

    const fetchComplaint = async () => {
      if (!profile?.authority_id) {
        setComplaint(null);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("complaints")
        .select(`*, complaint_categories (name), wards (name, authority_id)`)
        .eq("id", id)
        .single();

      if (!data) {
        setComplaint(null);
        setLoading(false);
        return;
      }

      const isAssignedToUser = data.assigned_to && data.assigned_to === user.id;
      const isInAuthorityWard = data.wards?.authority_id === profile.authority_id;

      if (!isAssignedToUser && !isInAuthorityWard) {
        setComplaint(null);
        setLoading(false);
        return;
      }

      if (data) {
        // Fetch citizen profile separately
        const { data: profile } = await supabase
          .from("users")
          .select("name")
          .eq("id", data.user_id)
          .single();

        setComplaint({
          ...data,
          severity: (data as any).priority,
          category_name: data.complaint_categories?.name,
          ward_name: data.wards?.name,
          citizen_name: profile?.name,
        });
        setNewStatus(data.status);
        setResolutionNotes(data.resolution_notes || "");
      }
      setLoading(false);
    };

    fetchComplaint();

    const channel = supabase
      .channel(`authority-complaint-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "complaints", filter: `id=eq.${id}` }, () => fetchComplaint())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, user, profile?.authority_id]);

  const handleUpdateStatus = async () => {
    if (!complaint || !newStatus || normalizeStatus(newStatus) === normalizeStatus(complaint.status)) return;

    setUpdating(true);

    try {
      const primaryStatus = toDbStatus(newStatus, complaint.status);
      const normalized = normalizeStatus(newStatus);
      const lowerStatus = normalized.toLowerCase();
      const fallbackStatus = normalized;

      const hasKey = (key: string) => Object.prototype.hasOwnProperty.call(complaint, key);

      const baseUpdates: any = {
        status: primaryStatus,
      };

      if (normalized === "Resolved") {
        if (hasKey("resolved_at")) {
          baseUpdates.resolved_at = new Date().toISOString();
        }
        if (hasKey("resolution_notes")) {
          baseUpdates.resolution_notes = resolutionNotes || null;
        }
      } else if (normalized === "Closed") {
        if (hasKey("closed_at")) {
          baseUpdates.closed_at = new Date().toISOString();
        }
      }

      const shouldAssign =
        !complaint.assigned_to && !complaint.assigned_authority_id && user?.id;

      const tryUpdate = async (statusValue: string, assignMode: "assigned_to" | "assigned_authority_id" | "none") => {
        const updates: any = { ...baseUpdates, status: statusValue };
        if (shouldAssign && assignMode === "assigned_to" && hasKey("assigned_to")) {
          updates.assigned_to = user?.id;
        }
        if (shouldAssign && assignMode === "assigned_authority_id" && hasKey("assigned_authority_id")) {
          updates.assigned_authority_id = user?.id;
        }
        const { error } = await supabase
          .from("complaints")
          .update(updates)
          .eq("id", complaint.id);
        return error;
      };

      const assignOrder: Array<"assigned_to" | "assigned_authority_id" | "none"> = [
        "assigned_to",
        "assigned_authority_id",
        "none",
      ];

      let updateError: any = null;
      for (const assignMode of assignOrder) {
        updateError = await tryUpdate(primaryStatus, assignMode);
        if (!updateError) break;
      }

      if (updateError) {
        for (const assignMode of assignOrder) {
          updateError = await tryUpdate(lowerStatus, assignMode);
          if (!updateError) break;
        }
      }

      if (updateError) {
        for (const assignMode of assignOrder) {
          updateError = await tryUpdate(fallbackStatus, assignMode);
          if (!updateError) break;
        }
      }

      if (updateError) {
        console.error("Complaint update error:", {
          message: (updateError as any)?.message,
          details: (updateError as any)?.details,
          hint: (updateError as any)?.hint,
          code: (updateError as any)?.code,
          raw: updateError,
          attemptedStatuses: [primaryStatus, lowerStatus, fallbackStatus],
        });
        throw updateError;
      }

      await new Promise((resolve) => setTimeout(resolve, 150));
      // Force a refresh after update in case realtime is delayed.
      setLoading(true);
      const { data: refreshed } = await supabase
        .from("complaints")
        .select(`*, complaint_categories (name), wards (name, authority_id)`)
        .eq("id", complaint.id)
        .single();
      if (refreshed) {
        const { data: profileData } = await supabase
          .from("users")
          .select("name")
          .eq("id", refreshed.user_id)
          .single();
        setComplaint({
          ...refreshed,
          severity: (refreshed as any).priority,
          category_name: refreshed.complaint_categories?.name,
          ward_name: refreshed.wards?.name,
          citizen_name: profileData?.name,
        });
      }
      setLoading(false);

      toast({
        title: "Status Updated",
        description: `Complaint status changed to ${normalizeStatus(newStatus).replace("_", " ")}`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: getUserFriendlyError(error, 'update'),
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <PremiumLayout navItems={authorityNavItems} title="Complaint Details">
        <div className="space-y-6">
          <div className="shimmer h-8 w-48 rounded-xl" />
          <div className="shimmer h-64 rounded-xl" />
        </div>
      </PremiumLayout>
    );
  }

  if (!complaint) {
    return (
      <PremiumLayout navItems={authorityNavItems} title="Complaint Details">
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground mb-4">Complaint not found or not in your wards</p>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/authority/complaints">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Complaints
            </Link>
          </Button>
        </div>
      </PremiumLayout>
    );
  }

  const canResolve = isActiveStatus(complaint.status);

  return (
    <PremiumLayout navItems={authorityNavItems} title="Complaint Details">
      <div className="space-y-6">
        <div className="flex items-center gap-4 fade-in">
          <Button asChild variant="ghost" size="icon" className="rounded-xl">
            <Link to="/authority/complaints">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold tracking-tight">{complaint.title}</h2>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="outline" className="rounded-lg">
                Priority: {complaint.severity}
              </Badge>
              <SlaIndicator deadline={complaint.sla_deadline} breached={complaint.is_sla_breached} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SeverityBadge severity={complaint.severity} />
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Complaint Details */}
          <div className="lg:col-span-2 space-y-6">
            <PremiumCard className="slide-up" style={{ animationDelay: "100ms" }}>
              <PremiumCardHeader>
                <PremiumCardTitle>Complaint Details</PremiumCardTitle>
              </PremiumCardHeader>
              <PremiumCardContent className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</label>
                  <p className="mt-1 text-sm leading-relaxed">{complaint.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <User className="h-3 w-3" /> Citizen
                    </label>
                    <p className="mt-1">{complaint.citizen_name || "Anonymous"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Location
                      <span title="Address masked for privacy">
                        <Shield className="h-3 w-3 text-muted-foreground/50" />
                      </span>
                    </label>
                    <p className="mt-1 text-muted-foreground italic">{maskAddress(complaint.location_details || "")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Full address protected for citizen privacy</p>
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
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Submitted
                    </label>
                    <p className="mt-1">{new Date(complaint.created_at).toLocaleString()}</p>
                  </div>
                  {complaint.sla_deadline && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Clock className="h-3 w-3" /> SLA Deadline
                      </label>
                      <p className={`mt-1 ${complaint.is_sla_breached ? "text-[hsl(var(--severity-critical))]" : ""}`}>
                        {new Date(complaint.sla_deadline).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </PremiumCardContent>
            </PremiumCard>

            {/* Activity Timeline */}
            <PremiumCard className="slide-up" style={{ animationDelay: "200ms" }}>
              <PremiumCardHeader>
                <PremiumCardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Activity & Responses
                </PremiumCardTitle>
                <PremiumCardDescription>
                  Status changes and responses visible to citizen
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
                <ActivityTimeline complaintId={complaint.id} canRespond={canResolve} />
              </PremiumCardContent>
            </PremiumCard>
          </div>

          {/* Actions Panel */}
          <div className="space-y-6">
            <PremiumCard className="slide-up" style={{ animationDelay: "300ms" }}>
              <PremiumCardHeader>
                <PremiumCardTitle>Update Status</PremiumCardTitle>
                <PremiumCardDescription>Change the complaint status</PremiumCardDescription>
              </PremiumCardHeader>
              <PremiumCardContent className="space-y-4">
                <Select
                  value={newStatus}
                  onValueChange={(val) => setNewStatus(val as ComplaintStatus)}
                  disabled={!canResolve}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Raised</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <AnimatePresence>
                  {normalizeStatus(newStatus) === "Resolved" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="text-sm font-medium">Resolution Notes</label>
                      <Textarea
                        placeholder="Describe how the issue was resolved..."
                        className="mt-2 rounded-xl min-h-[120px]"
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  onClick={handleUpdateStatus}
                  className="w-full rounded-xl btn-premium"
                  disabled={!canResolve || updating || normalizeStatus(newStatus) === normalizeStatus(complaint.status)}
                >
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Update Status
                    </>
                  )}
                </Button>

                {!canResolve && (
                  <p className="text-xs text-muted-foreground text-center">
                    This complaint has already been {complaint.status}
                  </p>
                )}
              </PremiumCardContent>
            </PremiumCard>

            {complaint.is_sla_breached && (
              <PremiumCard className="border-[hsl(var(--severity-critical))]/50 slide-up" style={{ animationDelay: "400ms" }}>
                <PremiumCardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--severity-critical-bg))]">
                      <AlertTriangle className="h-5 w-5 text-[hsl(var(--severity-critical))]" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-[hsl(var(--severity-critical))]">SLA Breached</p>
                      <p className="text-xs text-muted-foreground">
                        This complaint has exceeded its SLA deadline
                      </p>
                    </div>
                  </div>
                </PremiumCardContent>
              </PremiumCard>
            )}
          </div>
        </div>
      </div>
    </PremiumLayout>
  );
}


