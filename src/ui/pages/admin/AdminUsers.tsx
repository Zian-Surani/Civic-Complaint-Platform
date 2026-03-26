import { useEffect, useState } from "react";
import { supabase } from "../../integrations/supabase/client";
import { PremiumLayout, adminNavItems } from "../../components/layouts/PremiumLayout";
import { StatCard } from "../../components/ui/stat-card";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from "../../components/ui/premium-card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Users, Shield, UserCheck, Search, MapPin } from "lucide-react";
type AppRole = "citizen" | "authority" | "admin";

interface UserWithRole {
  user_id: string;
  role: AppRole;
  full_name: string;
  phone: string | null;
  created_at: string;
  wards?: string[];
}

const mapDbRole = (dbRole?: string | null): AppRole => {
  switch (dbRole) {
    case "civic_user":
      return "citizen";
    case "local_authority":
      return "authority";
    case "admin":
      return "admin";
    default:
      return "citizen";
  }
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: usersData } = await supabase
        .from("users")
        .select("id, name, phone, role, authority_id, created_at");

      if (!usersData) {
        setLoading(false);
        return;
      }

      const { data: wardsData } = await supabase
        .from("wards")
        .select("id, name, authority_id");

      const wardMap: Record<string, string[]> = {};
      wardsData?.forEach((ward) => {
        if (!ward.authority_id) return;
        if (!wardMap[ward.authority_id]) wardMap[ward.authority_id] = [];
        wardMap[ward.authority_id].push(ward.name);
      });

      const combinedUsers: UserWithRole[] = usersData.map((user) => {
        const mappedRole = mapDbRole(user.role);
        return {
          user_id: user.id,
          role: mappedRole,
          full_name: user.name || "Unknown User",
          phone: user.phone || null,
          created_at: user.created_at,
          wards: user.authority_id ? wardMap[user.authority_id] || [] : [],
        };
      });

      setUsers(combinedUsers);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.full_name.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    citizens: users.filter(u => u.role === "citizen").length,
    authorities: users.filter(u => u.role === "authority").length,
    admins: users.filter(u => u.role === "admin").length,
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case "admin": return "default";
      case "authority": return "secondary";
      case "citizen": return "outline";
      default: return "outline";
    }
  };

  const getRoleIcon = (role: AppRole) => {
    switch (role) {
      case "admin": return <Shield className="h-3 w-3" />;
      case "authority": return <UserCheck className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <PremiumLayout navItems={adminNavItems} title="Users">
      <div className="space-y-8">
        <div className="fade-in">
          <h2 className="text-2xl font-semibold tracking-tight">User Management</h2>
          <p className="text-muted-foreground mt-1">View and manage system users and their roles</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 slide-up">
          <StatCard title="Total Users" value={stats.total} icon={Users} />
          <StatCard title="Citizens" value={stats.citizens} icon={Users} variant="primary" />
          <StatCard title="Authorities" value={stats.authorities} icon={UserCheck} variant="warning" />
          <StatCard title="Admins" value={stats.admins} icon={Shield} variant="danger" />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row slide-up">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-40 rounded-xl">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="citizen">Citizens</SelectItem>
              <SelectItem value="authority">Authorities</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users List */}
        <PremiumCard className="slide-up" style={{ animationDelay: "200ms" }}>
          <PremiumCardHeader>
            <PremiumCardTitle>Users ({filteredUsers.length})</PremiumCardTitle>
            <PremiumCardDescription>All registered users in the system</PremiumCardDescription>
          </PremiumCardHeader>
          <PremiumCardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="shimmer h-16 rounded-xl" />)}
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No users found</p>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user, index) => (
                  <div 
                    key={user.user_id} 
                    className="flex items-center justify-between rounded-xl border border-border/50 p-4 transition-colors hover:bg-muted/50 fade-in"
                    style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.full_name}</p>
                          <Badge variant={getRoleBadgeVariant(user.role)} className="rounded-lg capitalize flex items-center gap-1">
                            {getRoleIcon(user.role)}
                            {user.role}
                          </Badge>
                        </div>
                        {user.phone && (
                          <p className="text-sm text-muted-foreground">{user.phone}</p>
                        )}
                        {user.role === "authority" && user.wards && user.wards.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {user.wards.map((ward, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs rounded-md px-1.5 py-0">
                                {ward}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PremiumCardContent>
        </PremiumCard>
      </div>
    </PremiumLayout>
  );
}
