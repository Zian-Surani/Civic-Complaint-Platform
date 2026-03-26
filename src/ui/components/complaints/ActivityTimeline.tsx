import { useEffect, useState } from "react";
import { supabase } from "../../integrations/supabase/client";
import { getUserFriendlyError } from "../../lib/error-utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../hooks/useAuth";
import { normalizeStatus } from "../../lib/status-utils";
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  User, 
  ArrowRight,
  Send,
  Loader2
} from "lucide-react";

interface ActivityUpdate {
  id: string;
  update_type: string;
  previous_status: string | null;
  new_status: string | null;
  content: string | null;
  created_at: string;
  user_id: string;
}

interface ActivityTimelineProps {
  complaintId: string;
  canRespond?: boolean;
}

const statusLabels: Record<string, string> = {
  Raised: "Raised",
  Assigned: "Assigned",
  In_Progress: "In Progress",
  Resolved: "Resolved",
  Closed: "Closed",
  pending: "Raised",
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const getStatusIcon = (status: string | null) => {
  switch (status) {
    case "Resolved":
    case "Closed":
      return <CheckCircle2 className="h-4 w-4 text-[hsl(var(--severity-very-low))]" />;
    case "In_Progress":
      return <Clock className="h-4 w-4 text-[hsl(var(--severity-medium))]" />;
    case "Assigned":
      return <User className="h-4 w-4 text-primary" />;
    default:
      return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
  }
};

export function ActivityTimeline({ complaintId, canRespond = false }: ActivityTimelineProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [updates, setUpdates] = useState<ActivityUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUpdates = async () => {
      const { data, error } = await supabase
        .from("complaint_updates")
        .select("*")
        .eq("complaint_id", complaintId)
        .order("created_at", { ascending: false });

      if (data && !error) {
        setUpdates(data);
      }
      setLoading(false);
    };

    fetchUpdates();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`complaint-updates-${complaintId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "complaint_updates", filter: `complaint_id=eq.${complaintId}` },
        () => fetchUpdates()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [complaintId]);

  const handleSubmitResponse = async () => {
    if (!responseText.trim() || !user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("complaint_updates").insert({
        complaint_id: complaintId,
        user_id: user.id,
        update_type: "response",
        content: responseText.trim(),
        is_public: true,
      });

      if (error) throw error;

      setResponseText("");
      toast({
        title: "Response Added",
        description: "Your response has been posted successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to add response",
        description: getUserFriendlyError(error, 'submit'),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="shimmer h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Response form for authorities */}
      {canRespond && (
        <div className="space-y-3 p-4 rounded-xl border border-border/50 bg-muted/30">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="h-4 w-4" />
            Add Response
          </div>
          <Textarea
            placeholder="Enter your response or update for the citizen..."
            className="rounded-xl min-h-[80px] resize-none"
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
          />
          <Button
            onClick={handleSubmitResponse}
            disabled={!responseText.trim() || submitting}
            className="rounded-xl"
            size="sm"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Post Response
              </>
            )}
          </Button>
        </div>
      )}

      {/* Timeline */}
      {updates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-3">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            No updates yet. Activity will appear here.
          </p>
        </div>
      ) : (
        <div className="relative space-y-3">
          {/* Timeline line */}
          <div className="absolute left-5 top-3 bottom-3 w-px bg-border" />

          {updates.map((update) => (
            <div key={update.id} className="relative flex gap-4 pl-2">
              {/* Timeline dot */}
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border border-border">
                {update.update_type === "status_change" ? (
                  getStatusIcon(update.new_status)
                ) : update.update_type === "response" ? (
                  <MessageSquare className="h-4 w-4 text-primary" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 rounded-xl border border-border/50 bg-muted/30 p-3 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                {update.update_type === "status_change" && (
                    <>
                      <span className="text-sm font-medium">Status Changed</span>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {statusLabels[normalizeStatus(update.previous_status)] || update.previous_status}
                        </Badge>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                          {statusLabels[normalizeStatus(update.new_status)] || update.new_status}
                        </Badge>
                      </div>
                    </>
                  )}
                  {update.update_type === "response" && (
                    <span className="text-sm font-medium">Authority Response</span>
                  )}
                  {update.update_type === "escalation" && (
                    <span className="text-sm font-medium text-[hsl(var(--severity-high))]">
                      Escalation
                    </span>
                  )}
                </div>
                
                {update.content && (
                  <p className="text-sm text-muted-foreground mt-1">{update.content}</p>
                )}
                
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(update.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

