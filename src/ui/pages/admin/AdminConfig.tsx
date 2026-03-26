import { useEffect, useState } from "react";
import { supabase } from "../../integrations/supabase/client";
import { getUserFriendlyError } from "../../lib/error-utils";
import { PremiumLayout, adminNavItems } from "../../components/layouts/PremiumLayout";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from "../../components/ui/premium-card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Settings, Clock, Tag, MapPin, AlertTriangle, Save, Plus } from "lucide-react";
import { toast } from "sonner";

// Validation constants
const SLA_MIN_HOURS = 1;
const SLA_MAX_HOURS = 8760; // 1 year

interface Category {
  id: string;
  name: string;
  description: string | null;
  base_weight: number;
  is_active: boolean;
}

interface Ward {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_sensitive: boolean;
}

interface SlaConfig {
  critical: number;
  high: number;
  medium: number;
  low: number;
  very_low: number;
}

export default function AdminConfig() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [slaConfig, setSlaConfig] = useState<SlaConfig>({
    critical: 4,
    high: 12,
    medium: 24,
    low: 48,
    very_low: 72,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [categoriesRes, wardsRes, configRes] = await Promise.all([
        supabase.from("complaint_categories").select("*").order("name"),
        supabase.from("wards").select("*").order("code"),
        supabase.from("system_config").select("*").eq("key", "sla_durations").maybeSingle(),
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (wardsRes.data) setWards(wardsRes.data);
      if (configRes.data?.value && typeof configRes.data.value === 'object' && !Array.isArray(configRes.data.value)) {
        const value = configRes.data.value as Record<string, unknown>;
        setSlaConfig({
          critical: (value.critical as number) || 4,
          high: (value.high as number) || 12,
          medium: (value.medium as number) || 24,
          low: (value.low as number) || 48,
          very_low: (value.very_low as number) || 72,
        });
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  // Validate SLA value is within acceptable range
  const validateSlaValue = (value: number): boolean => {
    return !isNaN(value) && value >= SLA_MIN_HOURS && value <= SLA_MAX_HOURS;
  };

  // Handle SLA input change with validation
  const handleSlaChange = (key: keyof SlaConfig, value: string) => {
    const numValue = parseInt(value) || 0;
    // Allow typing but will validate on save
    setSlaConfig({ ...slaConfig, [key]: numValue });
  };

  const handleSaveSla = async () => {
    // Client-side validation
    const invalidFields: string[] = [];
    for (const [key, value] of Object.entries(slaConfig)) {
      if (!validateSlaValue(value)) {
        invalidFields.push(key.replace('_', ' '));
      }
    }
    
    if (invalidFields.length > 0) {
      toast.error(`Invalid SLA values for: ${invalidFields.join(', ')}. Values must be between ${SLA_MIN_HOURS} and ${SLA_MAX_HOURS} hours.`);
      return;
    }

    setSaving(true);
    try {
      // Check if config exists first
      const { data: existing } = await supabase
        .from("system_config")
        .select("id")
        .eq("key", "sla_durations")
        .maybeSingle();

      const slaValue = JSON.parse(JSON.stringify(slaConfig));
      
      if (existing) {
        const { error } = await supabase
          .from("system_config")
          .update({
            value: slaValue,
            description: "SLA duration in hours for each severity level",
          })
          .eq("key", "sla_durations");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("system_config")
          .insert([{
            key: "sla_durations",
            value: slaValue,
            description: "SLA duration in hours for each severity level",
          }]);
        if (error) throw error;
      }

      toast.success("SLA configuration saved successfully");
    } catch (error) {
      toast.error(getUserFriendlyError(error, 'config'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCategory = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("complaint_categories")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
      
      setCategories(categories.map(c => c.id === id ? { ...c, is_active: isActive } : c));
      toast.success(`Category ${isActive ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error(getUserFriendlyError(error, 'config'));
    }
  };

  const handleToggleWardSensitivity = async (id: string, isSensitive: boolean) => {
    try {
      const { error } = await supabase
        .from("wards")
        .update({ is_sensitive: isSensitive })
        .eq("id", id);

      if (error) throw error;
      
      setWards(wards.map(w => w.id === id ? { ...w, is_sensitive: isSensitive } : w));
      toast.success(`Ward sensitivity ${isSensitive ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error(getUserFriendlyError(error, 'config'));
    }
  };

  return (
    <PremiumLayout navItems={adminNavItems} title="Configuration">
      <div className="space-y-8">
        <div className="fade-in">
          <h2 className="text-2xl font-semibold tracking-tight">System Configuration</h2>
          <p className="text-muted-foreground mt-1">Manage SLA settings, categories, and ward configurations</p>
        </div>

        <Tabs defaultValue="sla" className="slide-up">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid rounded-xl bg-muted p-1">
            <TabsTrigger value="sla" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-soft-sm">
              <Clock className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">SLA Settings</span>
              <span className="sm:hidden">SLA</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-soft-sm">
              <Tag className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Categories</span>
              <span className="sm:hidden">Cat.</span>
            </TabsTrigger>
            <TabsTrigger value="wards" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-soft-sm">
              <MapPin className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Wards</span>
              <span className="sm:hidden">Wards</span>
            </TabsTrigger>
          </TabsList>

          {/* SLA Settings */}
          <TabsContent value="sla" className="mt-6">
            <PremiumCard>
              <PremiumCardHeader>
                <PremiumCardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  SLA Duration Settings
                </PremiumCardTitle>
                <PremiumCardDescription>
                  Configure resolution time limits for each severity level (in hours)
                </PremiumCardDescription>
              </PremiumCardHeader>
              <PremiumCardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => <div key={i} className="shimmer h-12 rounded-xl" />)}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-[hsl(var(--severity-critical))]" />
                          Critical (hours)
                        </Label>
                        <Input
                          type="number"
                          min={SLA_MIN_HOURS}
                          max={SLA_MAX_HOURS}
                          value={slaConfig.critical}
                          onChange={(e) => handleSlaChange('critical', e.target.value)}
                          className={`rounded-xl ${!validateSlaValue(slaConfig.critical) ? 'border-destructive' : ''}`}
                        />
                        {!validateSlaValue(slaConfig.critical) && (
                          <p className="text-xs text-destructive">Must be 1-8760</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-[hsl(var(--severity-high))]" />
                          High (hours)
                        </Label>
                        <Input
                          type="number"
                          min={SLA_MIN_HOURS}
                          max={SLA_MAX_HOURS}
                          value={slaConfig.high}
                          onChange={(e) => handleSlaChange('high', e.target.value)}
                          className={`rounded-xl ${!validateSlaValue(slaConfig.high) ? 'border-destructive' : ''}`}
                        />
                        {!validateSlaValue(slaConfig.high) && (
                          <p className="text-xs text-destructive">Must be 1-8760</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-[hsl(var(--severity-medium))]" />
                          Medium (hours)
                        </Label>
                        <Input
                          type="number"
                          min={SLA_MIN_HOURS}
                          max={SLA_MAX_HOURS}
                          value={slaConfig.medium}
                          onChange={(e) => handleSlaChange('medium', e.target.value)}
                          className={`rounded-xl ${!validateSlaValue(slaConfig.medium) ? 'border-destructive' : ''}`}
                        />
                        {!validateSlaValue(slaConfig.medium) && (
                          <p className="text-xs text-destructive">Must be 1-8760</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-[hsl(var(--severity-low))]" />
                          Low (hours)
                        </Label>
                        <Input
                          type="number"
                          min={SLA_MIN_HOURS}
                          max={SLA_MAX_HOURS}
                          value={slaConfig.low}
                          onChange={(e) => handleSlaChange('low', e.target.value)}
                          className={`rounded-xl ${!validateSlaValue(slaConfig.low) ? 'border-destructive' : ''}`}
                        />
                        {!validateSlaValue(slaConfig.low) && (
                          <p className="text-xs text-destructive">Must be 1-8760</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-[hsl(var(--severity-very-low))]" />
                          Very Low (hours)
                        </Label>
                        <Input
                          type="number"
                          min={SLA_MIN_HOURS}
                          max={SLA_MAX_HOURS}
                          value={slaConfig.very_low}
                          onChange={(e) => handleSlaChange('very_low', e.target.value)}
                          className={`rounded-xl ${!validateSlaValue(slaConfig.very_low) ? 'border-destructive' : ''}`}
                        />
                        {!validateSlaValue(slaConfig.very_low) && (
                          <p className="text-xs text-destructive">Must be 1-8760</p>
                        )}
                      </div>
                    </div>
                    <Button onClick={handleSaveSla} disabled={saving} className="rounded-xl">
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? "Saving..." : "Save SLA Settings"}
                    </Button>
                  </div>
                )}
              </PremiumCardContent>
            </PremiumCard>
          </TabsContent>

          {/* Categories */}
          <TabsContent value="categories" className="mt-6">
            <PremiumCard>
              <PremiumCardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <PremiumCardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      Complaint Categories
                    </PremiumCardTitle>
                    <PremiumCardDescription>
                      Manage complaint categories and their base severity weights
                    </PremiumCardDescription>
                  </div>
                  <Badge variant="outline" className="rounded-lg">{categories.length} categories</Badge>
                </div>
              </PremiumCardHeader>
              <PremiumCardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(6)].map((_, i) => <div key={i} className="shimmer h-16 rounded-xl" />)}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category, index) => (
                      <div 
                        key={category.id} 
                        className="flex items-center justify-between rounded-xl border border-border/50 p-4 transition-colors hover:bg-muted/50 fade-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                            <Tag className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Base weight: {category.base_weight}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={category.is_active ? "default" : "secondary"} className="rounded-lg">
                            {category.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Switch
                            checked={category.is_active}
                            onCheckedChange={(checked) => handleToggleCategory(category.id, checked)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </PremiumCardContent>
            </PremiumCard>
          </TabsContent>

          {/* Wards */}
          <TabsContent value="wards" className="mt-6">
            <PremiumCard>
              <PremiumCardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <PremiumCardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Ward Management
                    </PremiumCardTitle>
                    <PremiumCardDescription>
                      Configure wards and sensitivity flags for priority escalation
                    </PremiumCardDescription>
                  </div>
                  <Badge variant="outline" className="rounded-lg">{wards.length} wards</Badge>
                </div>
              </PremiumCardHeader>
              <PremiumCardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => <div key={i} className="shimmer h-16 rounded-xl" />)}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {wards.map((ward, index) => (
                      <div 
                        key={ward.id} 
                        className="flex items-center justify-between rounded-xl border border-border/50 p-4 transition-colors hover:bg-muted/50 fade-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{ward.name}</p>
                              <Badge variant="outline" className="rounded-md text-xs">{ward.code}</Badge>
                            </div>
                            {ward.description && (
                              <p className="text-sm text-muted-foreground">{ward.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {ward.is_sensitive && (
                            <Badge variant="destructive" className="rounded-lg flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Sensitive
                            </Badge>
                          )}
                          <div className="flex items-center gap-2">
                            <Label className="text-sm text-muted-foreground">Sensitive</Label>
                            <Switch
                              checked={ward.is_sensitive}
                              onCheckedChange={(checked) => handleToggleWardSensitivity(ward.id, checked)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </PremiumCardContent>
            </PremiumCard>
          </TabsContent>
        </Tabs>
      </div>
    </PremiumLayout>
  );
}
