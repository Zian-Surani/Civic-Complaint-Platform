'use client'

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from "react-leaflet";
import { supabase } from "../../integrations/supabase/client";
import {
  PremiumCard,
  PremiumCardContent,
  PremiumCardHeader,
  PremiumCardTitle,
  PremiumCardDescription,
} from "../ui/premium-card";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { ZoomIn, ZoomOut, RotateCcw, Flame } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface WardData {
  id: string;
  name: string;
  code: string;
  totalComplaints: number;
  resolvedComplaints: number;
  avgResolutionHours: number;
  slaBreaches: number;
  criticalCount: number;
}

// Simulated ward boundaries (polygon coordinates)
// In production, these would come from actual GIS data
const wardBoundaries: Record<string, [number, number][]> = {
  "WARD-01": [[28.6139, 77.2090], [28.6239, 77.2090], [28.6239, 77.2190], [28.6139, 77.2190]],
  "WARD-02": [[28.6239, 77.2090], [28.6339, 77.2090], [28.6339, 77.2190], [28.6239, 77.2190]],
  "WARD-03": [[28.6139, 77.2190], [28.6239, 77.2190], [28.6239, 77.2290], [28.6139, 77.2290]],
  "WARD-04": [[28.6239, 77.2190], [28.6339, 77.2190], [28.6339, 77.2290], [28.6239, 77.2290]],
  "WARD-05": [[28.6339, 77.2090], [28.6439, 77.2090], [28.6439, 77.2190], [28.6339, 77.2190]],
  "WARD-06": [[28.6339, 77.2190], [28.6439, 77.2190], [28.6439, 77.2290], [28.6339, 77.2290]],
  "WARD-07": [[28.6139, 77.2290], [28.6239, 77.2290], [28.6239, 77.2390], [28.6139, 77.2390]],
  "WARD-08": [[28.6239, 77.2290], [28.6339, 77.2290], [28.6339, 77.2390], [28.6239, 77.2390]],
  "WARD-09": [[28.6339, 77.2290], [28.6439, 77.2290], [28.6439, 77.2390], [28.6339, 77.2390]],
  "WARD-10": [[28.6439, 77.2190], [28.6539, 77.2190], [28.6539, 77.2290], [28.6439, 77.2290]],
};

function MapControls() {
  const map = useMap();

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-xl bg-background/90 backdrop-blur-sm shadow-soft-md hover:bg-background"
        onClick={() => map.zoomIn()}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-xl bg-background/90 backdrop-blur-sm shadow-soft-md hover:bg-background"
        onClick={() => map.zoomOut()}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-xl bg-background/90 backdrop-blur-sm shadow-soft-md hover:bg-background"
        onClick={() => map.setView([28.6289, 77.2190], 13)}
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}

function getPerformanceColor(ward: WardData): string {
  const breachRate = ward.totalComplaints > 0
    ? ward.slaBreaches / ward.totalComplaints
    : 0;

  // Green to yellow to red gradient based on breach rate
  if (breachRate <= 0.1) return "#22c55e"; // Green - good
  if (breachRate <= 0.25) return "#84cc16"; // Lime - okay
  if (breachRate <= 0.4) return "#eab308"; // Yellow - moderate
  if (breachRate <= 0.6) return "#f97316"; // Orange - concerning
  return "#ef4444"; // Red - critical
}

function getHeatIntensity(ward: WardData): number {
  // Calculate heat intensity based on complaint density and severity
  const baseIntensity = Math.min(ward.totalComplaints / 20, 1);
  const severityBoost = (ward.criticalCount / Math.max(ward.totalComplaints, 1)) * 0.5;
  const breachBoost = (ward.slaBreaches / Math.max(ward.totalComplaints, 1)) * 0.3;

  return Math.min(baseIntensity + severityBoost + breachBoost, 1);
}

export default function WardMapClient() {
  const [wardData, setWardData] = useState<WardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [selectedWard, setSelectedWard] = useState<WardData | null>(null);

  useEffect(() => {
    const fetchWardData = async () => {
      const { data: wards } = await supabase.from("wards").select("id, name, code");

      if (wards) {
        const wardStats = await Promise.all(
          wards.map(async (ward) => {
            const [
              { count: total },
              { count: resolved },
              { count: breached },
              { count: critical },
            ] = await Promise.all([
              supabase.from("complaints").select("*", { count: "exact", head: true }).eq("ward_id", ward.id),
              supabase
                .from("complaints")
                .select("*", { count: "exact", head: true })
                .eq("ward_id", ward.id)
                .in("status", ["resolved", "closed"]),
              supabase.from("complaints").select("*", { count: "exact", head: true }).eq("ward_id", ward.id).eq("is_sla_breached", true),
              supabase.from("complaints").select("*", { count: "exact", head: true }).eq("ward_id", ward.id).eq("priority", "critical"),
            ]);

            return {
              id: ward.id,
              name: ward.name,
              code: ward.code,
              totalComplaints: total || 0,
              resolvedComplaints: resolved || 0,
              avgResolutionHours: 0,
              slaBreaches: breached || 0,
              criticalCount: critical || 0,
            };
          }),
        );
        setWardData(wardStats);
      }
      setLoading(false);
    };

    fetchWardData();
  }, []);

  const mapCenter: [number, number] = [28.6289, 77.2190];

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {/* Map */}
      <div className="lg:col-span-3">
        <PremiumCard>
          <PremiumCardHeader>
            <div className="flex items-center justify-between">
              <div>
                <PremiumCardTitle>Ward Performance Map</PremiumCardTitle>
                <PremiumCardDescription>
                  Interactive map showing ward-level complaint resolution performance
                </PremiumCardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="heatmap"
                    checked={showHeatmap}
                    onCheckedChange={setShowHeatmap}
                  />
                  <Label htmlFor="heatmap" className="text-sm flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-[hsl(var(--severity-high))]" />
                    Heatmap
                  </Label>
                </div>
              </div>
            </div>
          </PremiumCardHeader>
          <PremiumCardContent className="p-0">
            <div className="relative h-[500px] rounded-b-2xl overflow-hidden">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : (
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  scrollWheelZoom={true}
                  className="h-full w-full z-0"
                  style={{ background: "hsl(var(--muted))" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  />

                  {wardData.map((ward) => {
                    const boundaries = wardBoundaries[ward.code];
                    if (!boundaries) return null;

                    const color = getPerformanceColor(ward);
                    const heatIntensity = getHeatIntensity(ward);
                    const fillOpacity = showHeatmap ? 0.3 + heatIntensity * 0.5 : 0.4;

                    return (
                      <Polygon
                        key={ward.id}
                        positions={boundaries}
                        pathOptions={{
                          color: color,
                          fillColor: color,
                          fillOpacity: fillOpacity,
                          weight: selectedWard?.id === ward.id ? 3 : 2,
                        }}
                        eventHandlers={{
                          click: () => setSelectedWard(ward),
                          mouseover: (e) => {
                            e.target.setStyle({ weight: 3, fillOpacity: fillOpacity + 0.1 });
                          },
                          mouseout: (e) => {
                            e.target.setStyle({ weight: selectedWard?.id === ward.id ? 3 : 2, fillOpacity });
                          },
                        }}
                      >
                        <Tooltip sticky>
                          <div className="p-1">
                            <p className="font-semibold">{ward.name}</p>
                            <p className="text-xs text-muted-foreground">{ward.totalComplaints} complaints</p>
                          </div>
                        </Tooltip>
                      </Polygon>
                    );
                  })}

                  <MapControls />
                </MapContainer>
              )}
            </div>
          </PremiumCardContent>
        </PremiumCard>
      </div>

      {/* Legend & Selected Ward Info */}
      <div className="space-y-6">
        {/* Color Legend */}
        <PremiumCard>
          <PremiumCardHeader>
            <PremiumCardTitle className="text-base">Performance Legend</PremiumCardTitle>
          </PremiumCardHeader>
          <PremiumCardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-[#22c55e]" />
              <span className="text-sm">Excellent ({"<"}10% breach)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-[#84cc16]" />
              <span className="text-sm">Good (10-25% breach)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-[#eab308]" />
              <span className="text-sm">Moderate (25-40% breach)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-[#f97316]" />
              <span className="text-sm">Concerning (40-60% breach)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-[#ef4444]" />
              <span className="text-sm">Critical ({">"}60% breach)</span>
            </div>
          </PremiumCardContent>
        </PremiumCard>

        {/* Selected Ward Info */}
        <PremiumCard>
          <PremiumCardHeader>
            <PremiumCardTitle className="text-base">
              {selectedWard ? selectedWard.name : "Select a Ward"}
            </PremiumCardTitle>
          </PremiumCardHeader>
          <PremiumCardContent>
            {selectedWard ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <p className="text-2xl font-semibold">{selectedWard.totalComplaints}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="rounded-lg bg-[hsl(var(--severity-very-low-bg))] p-3 text-center">
                    <p className="text-2xl font-semibold text-[hsl(var(--severity-very-low))]">
                      {selectedWard.resolvedComplaints}
                    </p>
                    <p className="text-xs text-muted-foreground">Resolved</p>
                  </div>
                  <div className="rounded-lg bg-[hsl(var(--severity-critical-bg))] p-3 text-center">
                    <p className="text-2xl font-semibold text-[hsl(var(--severity-critical))]">
                      {selectedWard.criticalCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Critical</p>
                  </div>
                  <div className="rounded-lg bg-[hsl(var(--severity-high-bg))] p-3 text-center">
                    <p className="text-2xl font-semibold text-[hsl(var(--severity-high))]">
                      {selectedWard.slaBreaches}
                    </p>
                    <p className="text-xs text-muted-foreground">SLA Breaches</p>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Resolution Rate</span>
                    <span className="font-medium">
                      {selectedWard.totalComplaints > 0
                        ? `${Math.round((selectedWard.resolvedComplaints / selectedWard.totalComplaints) * 100)}%`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-[hsl(var(--severity-very-low))] transition-all duration-500"
                      style={{
                        width: selectedWard.totalComplaints > 0
                          ? `${(selectedWard.resolvedComplaints / selectedWard.totalComplaints) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Click on a ward to view detailed statistics
              </p>
            )}
          </PremiumCardContent>
        </PremiumCard>
      </div>
    </div>
  );
}
