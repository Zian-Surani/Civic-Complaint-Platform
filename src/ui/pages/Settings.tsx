import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../integrations/supabase/client";
import { getUserFriendlyError } from "../lib/error-utils";
import { PremiumLayout, citizenNavItems, authorityNavItems, adminNavItems } from "../components/layouts/PremiumLayout";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from "../components/ui/premium-card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { useToast } from "../hooks/use-toast";
import { RoleBadge } from "../components/badges/PremiumBadges";
import { User, Bell, Shield, Save, Loader2 } from "lucide-react";

export default function Settings() {
  const { user, profile, role, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Select nav items based on role
  const navItems = role === "admin" ? adminNavItems : role === "authority" ? authorityNavItems : citizenNavItems;

  const handleSaveProfile = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: fullName,
          phone: phone || null,
        })
        .eq("id", profile.id);

      if (error) throw error;

      await refreshProfile();

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: getUserFriendlyError(error, 'update'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PremiumLayout navItems={navItems} title="Settings">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="fade-in">
          <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Account Info */}
        <PremiumCard className="slide-up" style={{ animationDelay: "100ms" }}>
          <PremiumCardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <PremiumCardTitle>Account Information</PremiumCardTitle>
                <PremiumCardDescription>Your account details</PremiumCardDescription>
              </div>
            </div>
          </PremiumCardHeader>
          <PremiumCardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{profile?.full_name || "User"}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              {role && <RoleBadge role={role} />}
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded-xl"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-xl"
                  placeholder="Enter your phone number"
                />
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={loading}
                className="rounded-xl btn-premium"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </PremiumCardContent>
        </PremiumCard>

        {/* Notification Preferences */}
        <PremiumCard className="slide-up" style={{ animationDelay: "200ms" }}>
          <PremiumCardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--severity-medium-bg))]">
                <Bell className="h-5 w-5 text-[hsl(var(--severity-medium))]" />
              </div>
              <div>
                <PremiumCardTitle>Notification Preferences</PremiumCardTitle>
                <PremiumCardDescription>Manage how you receive notifications</PremiumCardDescription>
              </div>
            </div>
          </PremiumCardHeader>
          <PremiumCardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50">
              <div className="space-y-0.5">
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive email updates for complaint status changes
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50">
              <div className="space-y-0.5">
                <p className="font-medium">In-App Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Show notification alerts within the application
                </p>
              </div>
              <Switch checked={true} disabled />
            </div>
          </PremiumCardContent>
        </PremiumCard>

        {/* Security */}
        <PremiumCard className="slide-up" style={{ animationDelay: "300ms" }}>
          <PremiumCardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--severity-very-low-bg))]">
                <Shield className="h-5 w-5 text-[hsl(var(--severity-very-low))]" />
              </div>
              <div>
                <PremiumCardTitle>Security</PremiumCardTitle>
                <PremiumCardDescription>Account security settings</PremiumCardDescription>
              </div>
            </div>
          </PremiumCardHeader>
          <PremiumCardContent className="space-y-4">
            <div className="p-4 rounded-xl border border-border/50">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">
                    Last changed: Never
                  </p>
                </div>
                <Button variant="outline" className="rounded-xl" size="sm">
                  Change Password
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border/50">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security
                  </p>
                </div>
                <Button variant="outline" className="rounded-xl" size="sm" disabled>
                  Coming Soon
                </Button>
              </div>
            </div>
          </PremiumCardContent>
        </PremiumCard>
      </div>
    </PremiumLayout>
  );
}
