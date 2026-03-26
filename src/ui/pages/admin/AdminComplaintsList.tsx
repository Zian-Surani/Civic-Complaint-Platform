import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../integrations/supabase/client";
import { PremiumLayout, adminNavItems } from "../../components/layouts/PremiumLayout";
import { PremiumCard, PremiumCardContent } from "../../components/ui/premium-card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { SeverityBadge, StatusBadge, SlaIndicator } from "../../components/badges/PremiumBadges";
import { FileText, Search, MapPin, Filter, Clock, Users } from "lucide-react";
import type { Database } from "../../integrations/supabase/types";
import { normalizeStatus } from "../../lib/status-utils";

type SeverityLevel = string;
type ComplaintStatus = string;

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  severity: SeverityLevel;
  sla_deadline: string | null;
  is_sla_breached: boolean;
  created_at: string;
  category_name?: string;
  ward_name?: string;
}

interface Ward {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

export default function AdminComplaintsList() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [wardFilter, setWardFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      // Fetch all wards and categories for filters
      const [wardsRes, categoriesRes] = await Promise.all([
        supabase.from("wards").select("id, name").order("name"),
        supabase.from("complaint_categories").select("id, name").eq("is_active", true).order("name"),
      ]);

      if (wardsRes.data) setWards(wardsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);

      // Fetch all complaints
      const { data } = await supabase
        .from("complaints")
        .select(`id, title, description, status, priority, sla_deadline, is_sla_breached, created_at, complaint_categories (name), wards (name)`)
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

    fetchData();

    const channel = supabase
      .channel("admin-complaints-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || normalizeStatus(c.status) === normalizeStatus(statusFilter);
    const matchesSeverity = severityFilter === "all" || c.severity === severityFilter;
    const matchesWard = wardFilter === "all" || c.ward_name === wards.find(w => w.id === wardFilter)?.name;
    const matchesCategory = categoryFilter === "all" || c.category_name === categories.find(cat => cat.id === categoryFilter)?.name;
    return matchesSearch && matchesStatus && matchesSeverity && matchesWard && matchesCategory;
  });

  return (
    <PremiumLayout navItems={adminNavItems} title="All Complaints">
      <div className="space-y-6">
        <div className="fade-in">
          <h2 className="text-2xl font-semibold tracking-tight">All Complaints</h2>
          <p className="text-muted-foreground mt-1">
            Global view of all complaints across {wards.length} wards • {complaints.length} total complaints
          </p>
        </div>

        {/* Filters */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 slide-up">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search complaints..."
              className="pl-10 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={wardFilter} onValueChange={setWardFilter}>
            <SelectTrigger className="rounded-xl">
              <MapPin className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Ward" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Wards</SelectItem>
              {wards.map((ward) => (
                <SelectItem key={ward.id} value={ward.id}>{ward.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="rounded-xl">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Raised">Raised</SelectItem>
              <SelectItem value="Assigned">Assigned</SelectItem>
              <SelectItem value="In_Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="rounded-lg">{filteredComplaints.length}</Badge>
          <span>complaints found</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
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
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters
              </p>
            </PremiumCardContent>
          </PremiumCard>
        ) : (
          <div className="space-y-3">
            {filteredComplaints.map((complaint, index) => (
              <Link
                key={complaint.id}
                to={`/admin/complaints/${complaint.id}`}
                className="block"
              >
                <PremiumCard className="transition-all duration-200 hover:shadow-soft-md hover:border-primary/20 cursor-pointer fade-in" style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}>
                  <PremiumCardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{complaint.title}</h3>
                          <Badge variant="outline" className="text-xs rounded-md px-1.5 py-0 h-5 shrink-0">
                            {complaint.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                          {complaint.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {complaint.ward_name}
                          </span>
                          <span>{complaint.category_name}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(complaint.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <SlaIndicator deadline={complaint.sla_deadline} breached={complaint.is_sla_breached} />
                        <div className="flex items-center gap-1">
                          <SeverityBadge severity={complaint.severity} size="sm" />
                          <StatusBadge status={complaint.status} size="sm" />
                        </div>
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


