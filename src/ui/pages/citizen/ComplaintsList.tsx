import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../integrations/supabase/client";
import { PremiumLayout, citizenNavItems } from "../../components/layouts/PremiumLayout";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from "../../components/ui/premium-card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { SeverityBadge, StatusBadge } from "../../components/badges/PremiumBadges";
import { FileText, Plus, Search, Calendar, MapPin } from "lucide-react";
import type { Database } from "../../integrations/supabase/types";

type SeverityLevel = string;
type ComplaintStatus = string;

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  severity: SeverityLevel;
  created_at: string;
  category_name?: string;
  ward_name?: string;
}

export default function ComplaintsList() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchComplaints = async () => {
      const { data } = await supabase
        .from("complaints")
        .select(`id, title, description, status, priority, created_at, complaint_categories (name), wards (name)`)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setComplaints(
          data.map((c: any) => ({
            ...c,
            severity: c.priority,
            category_name: c.complaint_categories?.name,
            ward_name: c.wards?.name,
          }))
        );
      }
      setLoading(false);
    };

    fetchComplaints();
  }, [user]);

  const filteredComplaints = complaints.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PremiumLayout navItems={citizenNavItems} title="My Complaints">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between fade-in">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">My Complaints</h2>
            <p className="text-muted-foreground mt-1">View and track all your submitted complaints</p>
          </div>
          <Button asChild className="rounded-xl btn-premium">
            <Link to="/citizen/new">
              <Plus className="mr-2 h-4 w-4" />
              New Complaint
            </Link>
          </Button>
        </div>

        <div className="relative slide-up">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search complaints..."
            className="pl-10 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="shimmer h-24 rounded-xl" />
            ))}
          </div>
        ) : filteredComplaints.length === 0 ? (
          <PremiumCard>
            <PremiumCardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
                <FileText className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="font-medium">No complaints found</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {search ? "Try adjusting your search" : "Submit your first complaint to get started"}
              </p>
              {!search && (
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to="/citizen/new">
                    <Plus className="mr-2 h-4 w-4" />
                    New Complaint
                  </Link>
                </Button>
              )}
            </PremiumCardContent>
          </PremiumCard>
        ) : (
          <div className="space-y-3">
            {filteredComplaints.map((complaint, index) => (
              <Link
                key={complaint.id}
                to={`/citizen/complaints/${complaint.id}`}
                className="block"
              >
                <PremiumCard className="transition-all duration-200 hover:shadow-soft-md hover:border-primary/20 cursor-pointer fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <PremiumCardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate mb-1">{complaint.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {complaint.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {complaint.ward_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(complaint.created_at).toLocaleDateString()}
                          </span>
                          <span>{complaint.category_name}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <SeverityBadge severity={complaint.severity} size="sm" />
                        <StatusBadge status={complaint.status} size="sm" />
                      </div>
                    </div>
                  </PremiumCardContent>
                </PremiumCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PremiumLayout>
  );
}

