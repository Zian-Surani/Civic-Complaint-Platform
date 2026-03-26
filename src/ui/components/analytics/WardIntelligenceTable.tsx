import { useEffect, useState } from "react";
import { supabase } from "../../integrations/supabase/client";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from "../ui/premium-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, MapPin, Filter } from "lucide-react";
import { cn } from "../../lib/utils";

interface WardStats {
  id: string;
  name: string;
  code: string;
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  avgResolutionHours: number;
  slaBreaches: number;
  resolutionRate: number;
  breachRate: number;
}

interface WardIntelligenceTableProps {
  compact?: boolean;
}

type SortField = "name" | "totalComplaints" | "avgResolutionHours" | "slaBreaches" | "resolutionRate" | "breachRate";
type SortOrder = "asc" | "desc";

export function WardIntelligenceTable({ compact = false }: WardIntelligenceTableProps) {
  const [data, setData] = useState<WardStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("totalComplaints");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [performanceFilter, setPerformanceFilter] = useState<string>("all");

  useEffect(() => {
    const fetchWardStats = async () => {
      const { data: wards } = await supabase.from("wards").select("id, name, code");

      if (wards) {
        const wardStats = await Promise.all(
          wards.map(async (ward) => {
            const [
              { count: total },
              { count: resolved },
              { count: pending },
              { count: breached },
            ] = await Promise.all([
              supabase.from("complaints").select("*", { count: "exact", head: true }).eq("ward_id", ward.id),
              supabase.from("complaints").select("*", { count: "exact", head: true }).eq("ward_id", ward.id).in("status", ["resolved", "closed"]),
              supabase.from("complaints").select("*", { count: "exact", head: true }).eq("ward_id", ward.id).in("status", ["pending", "assigned", "in_progress"]),
              supabase.from("complaints").select("*", { count: "exact", head: true }).eq("ward_id", ward.id).eq("is_sla_breached", true),
            ]);

            const totalCount = total || 0;
            const resolvedCount = resolved || 0;
            const breachedCount = breached || 0;

            return {
              id: ward.id,
              name: ward.name,
              code: ward.code,
              totalComplaints: totalCount,
              resolvedComplaints: resolvedCount,
              pendingComplaints: pending || 0,
              avgResolutionHours: 0, // Would come from daily_ward_stats
              slaBreaches: breachedCount,
              resolutionRate: totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0,
              breachRate: totalCount > 0 ? Math.round((breachedCount / totalCount) * 100) : 0,
            };
          })
        );

        setData(wardStats);
      }
      setLoading(false);
    };

    fetchWardStats();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5" />;
    return sortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />;
  };

  const getPerformanceStatus = (ward: WardStats) => {
    if (ward.breachRate >= 30) return "critical";
    if (ward.breachRate >= 15) return "warning";
    return "good";
  };

  const filteredAndSortedData = data
    .filter((ward) => {
      const matchesSearch = ward.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = 
        performanceFilter === "all" ||
        (performanceFilter === "good" && getPerformanceStatus(ward) === "good") ||
        (performanceFilter === "warning" && getPerformanceStatus(ward) === "warning") ||
        (performanceFilter === "critical" && getPerformanceStatus(ward) === "critical");
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

  const displayData = compact ? filteredAndSortedData.slice(0, 5) : filteredAndSortedData;

  return (
    <PremiumCard>
      <PremiumCardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <PremiumCardTitle>Ward Intelligence</PremiumCardTitle>
            <PremiumCardDescription>Performance metrics and complaint statistics by ward</PremiumCardDescription>
          </div>
          {!compact && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search wards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-48 h-9 rounded-xl"
                />
              </div>
              <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
                <SelectTrigger className="w-36 h-9 rounded-xl">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wards</SelectItem>
                  <SelectItem value="good">Good Performance</SelectItem>
                  <SelectItem value="warning">Needs Attention</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </PremiumCardHeader>
      <PremiumCardContent className="p-0">
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5">
                    <Button variant="ghost" size="sm" onClick={() => handleSort("name")} className="h-8 px-2 -ml-2 font-medium">
                      Ward {getSortIcon("name")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("totalComplaints")} className="h-8 px-2 -ml-2 font-medium">
                      Complaints {getSortIcon("totalComplaints")}
                    </Button>
                  </TableHead>
                  {!compact && (
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => handleSort("resolutionRate")} className="h-8 px-2 -ml-2 font-medium">
                        Resolution % {getSortIcon("resolutionRate")}
                      </Button>
                    </TableHead>
                  )}
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("slaBreaches")} className="h-8 px-2 -ml-2 font-medium">
                      SLA Breaches {getSortIcon("slaBreaches")}
                    </Button>
                  </TableHead>
                  <TableHead className="pr-5">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={compact ? 4 : 5} className="text-center py-8 text-muted-foreground">
                      No wards found
                    </TableCell>
                  </TableRow>
                ) : (
                  displayData.map((ward, index) => {
                    const status = getPerformanceStatus(ward);
                    return (
                      <TableRow key={ward.id} className="fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                        <TableCell className="pl-5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                              <MapPin className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{ward.name}</p>
                              <p className="text-xs text-muted-foreground">{ward.code}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{ward.totalComplaints}</p>
                            <p className="text-xs text-muted-foreground">{ward.pendingComplaints} pending</p>
                          </div>
                        </TableCell>
                        {!compact && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div 
                                  className="h-full bg-[hsl(var(--severity-very-low))] transition-all"
                                  style={{ width: `${ward.resolutionRate}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{ward.resolutionRate}%</span>
                            </div>
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-semibold",
                              ward.slaBreaches > 0 && "text-[hsl(var(--severity-critical))]"
                            )}>
                              {ward.slaBreaches}
                            </span>
                            <span className="text-xs text-muted-foreground">({ward.breachRate}%)</span>
                          </div>
                        </TableCell>
                        <TableCell className="pr-5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-lg border-0",
                              status === "good" && "bg-[hsl(var(--severity-very-low-bg))] text-[hsl(var(--severity-very-low))]",
                              status === "warning" && "bg-[hsl(var(--severity-medium-bg))] text-[hsl(var(--severity-medium))]",
                              status === "critical" && "bg-[hsl(var(--severity-critical-bg))] text-[hsl(var(--severity-critical))]"
                            )}
                          >
                            {status === "good" && "Good"}
                            {status === "warning" && "Attention"}
                            {status === "critical" && "Critical"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </PremiumCardContent>
    </PremiumCard>
  );
}

