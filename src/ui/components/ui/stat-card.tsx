import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "../animations/AnimatedCounter";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  className?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = "default",
  className,
  delay = 0,
}: StatCardProps) {
  const variantStyles = {
    default: {
      card: "bg-card border-border/50",
      icon: "bg-muted text-muted-foreground",
      value: "text-foreground",
      glow: "",
    },
    primary: {
      card: "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20",
      icon: "bg-primary/10 text-primary",
      value: "text-foreground",
      glow: "shadow-glow-primary",
    },
    success: {
      card: "bg-gradient-to-br from-[hsl(var(--severity-very-low))]/5 to-[hsl(var(--severity-very-low))]/10 border-[hsl(var(--severity-very-low))]/20",
      icon: "bg-[hsl(var(--severity-very-low))]/10 text-[hsl(var(--severity-very-low))]",
      value: "text-[hsl(var(--severity-very-low))]",
      glow: "",
    },
    warning: {
      card: "bg-gradient-to-br from-[hsl(var(--severity-high))]/5 to-[hsl(var(--severity-high))]/10 border-[hsl(var(--severity-high))]/20",
      icon: "bg-[hsl(var(--severity-high))]/10 text-[hsl(var(--severity-high))]",
      value: "text-[hsl(var(--severity-high))]",
      glow: "",
    },
    danger: {
      card: "bg-gradient-to-br from-[hsl(var(--severity-critical))]/5 to-[hsl(var(--severity-critical))]/10 border-[hsl(var(--severity-critical))]/20",
      icon: "bg-[hsl(var(--severity-critical))]/10 text-[hsl(var(--severity-critical))]",
      value: "text-[hsl(var(--severity-critical))]",
      glow: "",
    },
  };

  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn(
        "group rounded-2xl border p-5 shadow-soft-sm transition-all duration-300",
        styles.card,
        styles.glow,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={cn("text-2xl sm:text-3xl font-semibold tracking-tight", styles.value)}>
            {typeof value === "number" ? (
              <AnimatedCounter value={value} duration={1200} />
            ) : (
              value
            )}
          </div>
          {trend && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive
                    ? "text-[hsl(var(--severity-very-low))]"
                    : "text-[hsl(var(--severity-critical))]"
                )}
              >
                {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
              </span>
              {trend.label && (
                <span className="text-xs text-muted-foreground">{trend.label}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <motion.div 
            className={cn(
              "rounded-xl p-2.5 transition-all duration-300",
              styles.icon
            )}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Icon className="h-5 w-5" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

