import { useEffect, useState } from "react";
import { supabase } from "../../integrations/supabase/client";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from "../ui/premium-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, User, Trophy, AlertTriangle, Medal } from "lucide-react";
import { cn } from "../../lib/utils";

interface AuthorityStats {
  id: string;
  name: string;
  assignedWards: string[];
  totalAssigned: number;
  totalResolved: number;
  avgResolutionHours: number;
  slaBreaches: number;
  resolutionRate: number;
  rank: number;
}

type SortField = "name" | "totalAssigned" | "totalResolved" | "slaBreaches" | "resolutionRate";
type SortOrder = "asc" | "desc";

export function AuthorityRankingTable() {
  const [data, setData] = useState<AuthorityStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("resolutionRate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    const fetchAuthorityStats = async () => {
      // Get all authorities
      const { data: authorities } = await supabase
        .from("users")
        .select("id, name, authority_id, role")
        .eq("role", "local_authority");

      if (authorities) {
        const authorityStats = await Promise.all(
          authorities.map(async (auth) => {
            // Get assigned wards
            const { data: wardsData } = await supabase
              .from("wards")
              .select("id, name")
              .eq("authority_id", auth.authority_id);

            const wardNames = wardsData?.map((w) => w.name).filter(Boolean) as string[] || [];
            const wardIds = wardsData?.map((w) => w.id) || [];

            if (wardIds.length === 0) {
              return {
                id: auth.id,
                name: auth.name || "Unknown",
                assignedWards: wardNames,
                totalAssigned: 0,
                totalResolved: 0,
                avgResolutionHours: 0,
                slaBreaches: 0,
                resolutionRate: 0,
                rank: 0,
              };
            }

            // Get complaints stats
            const [
              { count: assigned },
              { count: resolved },
              { count: breached },
            ] = await Promise.all([
              supabase.from("complaints").select("*", { count: "exact", head: true }).in("ward_id", wardIds),
              supabase.from("complaints").select("*", { count: "exact", head: true }).in("ward_id", wardIds).in("status", ["resolved", "closed"]),
              supabase.from("complaints").select("*", { count: "exact", head: true }).in("ward_id", wardIds).eq("is_sla_breached", true),
            ]);

            const totalAssigned = assigned || 0;
            const totalResolved = resolved || 0;

            return {
              id: auth.id,
              name: auth.name || "Unknown",
              assignedWards: wardNames,
              totalAssigned,
              totalResolved,
              avgResolutionHours: 0, // Would come from authority_performance
              slaBreaches: breached || 0,
              resolutionRate: totalAssigned > 0 ? Math.round((totalResolved / totalAssigned) * 100) : 0,
              rank: 0,
            };
          })
        );

        // Calculate ranks based on resolution rate and breaches
        const ranked = authorityStats
          .sort((a, b) => {
            // Primary: resolution rate (higher is better)
            if (b.resolutionRate !== a.resolutionRate) {
              return b.resolutionRate - a.resolutionRate;
            }
            // Secondary: fewer breaches is better
            return a.slaBreaches - b.slaBreaches;
          })
          .map((auth, index) => ({ ...auth, rank: index + 1 }));

        setData(ranked);
      }
      setLoading(false);
    };

    fetchAuthorityStats();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder(field === "name" ? "asc" : "desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5" />;
    return sortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />;
  };

  const getPerformanceIndicator = (auth: AuthorityStats) => {
    if (auth.totalAssigned === 0) return "new";
    if (auth.resolutionRate >= 80 && auth.slaBreaches === 0) return "top";
    if (auth.resolutionRate >= 60) return "good";
    if (auth.resolutionRate >= 40) return "average";
    return "underperforming";
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Medal className="h-5 w-5 text-[hsl(var(--severity-medium))]" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-muted-foreground" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-[hsl(var(--severity-high))]" />;
    return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>;
  };

  const filteredAndSortedData = data
    .filter((auth) => auth.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

  return (
    <PremiumCard>
      <PremiumCardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <PremiumCardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[hsl(var(--severity-medium))]" />
              Authority Performance Ranking
            </PremiumCardTitle>
            <PremiumCardDescription>Performance metrics and rankings for all authorities</PremiumCardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search authorities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-56 h-9 rounded-xl"
            />
          </div>
        </div>
      </PremiumCardHeader>
      <PremiumCardContent className="p-0">
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5 w-16">Rank</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("name")} className="h-8 px-2 -ml-2 font-medium">
                      Authority {getSortIcon("name")}
                    </Button>
                  </TableHead>
                  <TableHead>Assigned Wards</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("totalAssigned")} className="h-8 px-2 -ml-2 font-medium">
                      Handled {getSortIcon("totalAssigned")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("resolutionRate")} className="h-8 px-2 -ml-2 font-medium">
                      Resolution % {getSortIcon("resolutionRate")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("slaBreaches")} className="h-8 px-2 -ml-2 font-medium">
                      SLA Breaches {getSortIcon("slaBreaches")}
                    </Button>
                  </TableHead>
                  <TableHead className="pr-5">Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No authorities found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedData.map((auth, index) => {
                    const performance = getPerformanceIndicator(auth);
                    return (
                      <TableRow 
                        key={auth.id} 
                        className={cn(
                          "fade-in",
                          auth.rank <= 3 && "bg-[hsl(var(--severity-medium-bg))]/30"
                        )}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <TableCell className="pl-5">
                          <div className="flex h-8 w-8 items-center justify-center">
                            {getRankBadge(auth.rank)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">{auth.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {auth.assignedWards.length > 0 ? (
                              auth.assignedWards.slice(0, 2).map((ward, i) => (
                                <Badge key={i} variant="outline" className="rounded-md text-xs px-1.5 py-0 h-5 border-0 bg-muted/50">
                                  {ward}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">None</span>
                            )}
                            {auth.assignedWards.length > 2 && (
                              <Badge variant="outline" className="rounded-md text-xs px-1.5 py-0 h-5 border-0 bg-muted/50">
                                +{auth.assignedWards.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{auth.totalAssigned}</p>
                            <p className="text-xs text-muted-foreground">{auth.totalResolved} resolved</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full transition-all",
                                  auth.resolutionRate >= 70 ? "bg-[hsl(var(--severity-very-low))]" :
                                  auth.resolutionRate >= 40 ? "bg-[hsl(var(--severity-medium))]" :
                                  "bg-[hsl(var(--severity-critical))]"
                                )}
                                style={{ width: `${auth.resolutionRate}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{auth.resolutionRate}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {auth.slaBreaches > 0 && (
                              <AlertTriangle className="h-4 w-4 text-[hsl(var(--severity-critical))]" />
                            )}
                            <span className={cn(
                              "font-semibold",
                              auth.slaBreaches > 0 && "text-[hsl(var(--severity-critical))]"
                            )}>
                              {auth.slaBreaches}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="pr-5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-lg border-0",
                              performance === "top" && "bg-[hsl(var(--severity-medium-bg))] text-[hsl(var(--severity-medium))]",
                              performance === "good" && "bg-[hsl(var(--severity-very-low-bg))] text-[hsl(var(--severity-very-low))]",
                              performance === "average" && "bg-[hsl(var(--severity-medium-bg))] text-[hsl(var(--severity-medium))]",
                              performance === "underperforming" && "bg-[hsl(var(--severity-critical-bg))] text-[hsl(var(--severity-critical))]",
                              performance === "new" && "bg-muted text-muted-foreground"
                            )}
                          >
                            {performance === "top" && "⭐ Top Performer"}
                            {performance === "good" && "Good"}
                            {performance === "average" && "Average"}
                            {performance === "underperforming" && "Needs Improvement"}
                            {performance === "new" && "New"}
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
