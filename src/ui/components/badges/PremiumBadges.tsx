import { cn } from "../../lib/utils";
type SeverityLevel = string;
type ComplaintStatus = string;

interface SeverityBadgeProps {
  severity: SeverityLevel;
  showScore?: boolean;
  score?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SeverityBadge({
  severity,
  showScore,
  score,
  size = "md",
  className,
}: SeverityBadgeProps) {
  const severityConfig: Record<
    SeverityLevel,
    { label: string; dotColor: string; bgColor: string; textColor: string }
  > = {
    critical: {
      label: "Critical",
      dotColor: "bg-[hsl(var(--severity-critical))]",
      bgColor: "bg-[hsl(var(--severity-critical-bg))]",
      textColor: "text-[hsl(var(--severity-critical))]",
    },
    high: {
      label: "High",
      dotColor: "bg-[hsl(var(--severity-high))]",
      bgColor: "bg-[hsl(var(--severity-high-bg))]",
      textColor: "text-[hsl(var(--severity-high))]",
    },
    medium: {
      label: "Medium",
      dotColor: "bg-[hsl(var(--severity-medium))]",
      bgColor: "bg-[hsl(var(--severity-medium-bg))]",
      textColor: "text-[hsl(var(--severity-medium))]",
    },
    low: {
      label: "Low",
      dotColor: "bg-[hsl(var(--severity-low))]",
      bgColor: "bg-[hsl(var(--severity-low-bg))]",
      textColor: "text-[hsl(var(--severity-low))]",
    },
    very_low: {
      label: "Very Low",
      dotColor: "bg-[hsl(var(--severity-very-low))]",
      bgColor: "bg-[hsl(var(--severity-very-low-bg))]",
      textColor: "text-[hsl(var(--severity-very-low))]",
    },
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  };

  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  const config = severityConfig[severity as keyof typeof severityConfig] ?? severityConfig.medium;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium transition-colors",
        sizeStyles[size],
        config.bgColor,
        config.textColor,
        className
      )}
    >
      <span className={cn("rounded-full", dotSizes[size], config.dotColor)} />
      {config.label}
      {showScore && score !== undefined && (
        <span className="opacity-70">({score})</span>
      )}
    </span>
  );
}

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatusBadge({ status, size = "md", className }: StatusBadgeProps) {
  const statusConfig: Record<
    string,
    { label: string; bgColor: string; textColor: string }
  > = {
    Raised: {
      label: "Raised",
      bgColor: "bg-[hsl(var(--status-pending-bg))]",
      textColor: "text-[hsl(var(--status-pending))]",
    },
    Assigned: {
      label: "Assigned",
      bgColor: "bg-[hsl(var(--status-assigned-bg))]",
      textColor: "text-[hsl(var(--status-assigned))]",
    },
    In_Progress: {
      label: "In Progress",
      bgColor: "bg-[hsl(var(--status-in-progress-bg))]",
      textColor: "text-[hsl(var(--status-in-progress))]",
    },
    Resolved: {
      label: "Resolved",
      bgColor: "bg-[hsl(var(--status-resolved-bg))]",
      textColor: "text-[hsl(var(--status-resolved))]",
    },
    Closed: {
      label: "Closed",
      bgColor: "bg-[hsl(var(--status-closed-bg))]",
      textColor: "text-[hsl(var(--status-closed))]",
    },
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  const normalizeStatus = (value: string) => {
    const lowered = value.toLowerCase();
    if (lowered === "raised" || lowered === "pending") return "Raised";
    if (lowered === "assigned") return "Assigned";
    if (lowered === "in_progress" || lowered === "in progress") return "In_Progress";
    if (lowered === "resolved") return "Resolved";
    if (lowered === "closed") return "Closed";
    return "Raised";
  };

  const key = statusConfig[status] ? status : normalizeStatus(status);
  const config = statusConfig[key] ?? statusConfig.Raised;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        sizeStyles[size],
        config.bgColor,
        config.textColor,
        className
      )}
    >
      {config.label}
    </span>
  );
}

interface RoleBadgeProps {
  role: "citizen" | "authority" | "admin";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RoleBadge({ role, size = "md", className }: RoleBadgeProps) {
  const roleConfig: Record<
    string,
    { label: string; bgColor: string; textColor: string }
  > = {
    citizen: {
      label: "Citizen",
      bgColor: "bg-[hsl(var(--role-citizen-bg))]",
      textColor: "text-[hsl(var(--role-citizen))]",
    },
    authority: {
      label: "Authority",
      bgColor: "bg-[hsl(var(--role-authority-bg))]",
      textColor: "text-[hsl(var(--role-authority))]",
    },
    admin: {
      label: "Admin",
      bgColor: "bg-[hsl(var(--role-admin-bg))]",
      textColor: "text-[hsl(var(--role-admin))]",
    },
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  const config = roleConfig[role];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        sizeStyles[size],
        config.bgColor,
        config.textColor,
        className
      )}
    >
      {config.label}
    </span>
  );
}

interface SlaIndicatorProps {
  deadline: string | null;
  breached: boolean;
  className?: string;
}

export function SlaIndicator({ deadline, breached, className }: SlaIndicatorProps) {
  if (!deadline && !breached) return null;

  const getSlaStatus = () => {
    if (breached)
      return { text: "SLA Breached", color: "text-[hsl(var(--severity-critical))]", bg: "bg-[hsl(var(--severity-critical-bg))]" };

    if (!deadline) return null;

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursLeft = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursLeft < 0)
      return { text: "SLA Breached", color: "text-[hsl(var(--severity-critical))]", bg: "bg-[hsl(var(--severity-critical-bg))]" };
    if (hoursLeft < 2)
      return {
        text: `${Math.round(hoursLeft * 60)}m left`,
        color: "text-[hsl(var(--severity-high))]",
        bg: "bg-[hsl(var(--severity-high-bg))]",
      };
    if (hoursLeft < 24)
      return {
        text: `${Math.round(hoursLeft)}h left`,
        color: "text-[hsl(var(--severity-medium))]",
        bg: "bg-[hsl(var(--severity-medium-bg))]",
      };
    return {
      text: `${Math.round(hoursLeft / 24)}d left`,
      color: "text-[hsl(var(--severity-very-low))]",
      bg: "bg-[hsl(var(--severity-very-low-bg))]",
    };
  };

  const status = getSlaStatus();
  if (!status) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        status.bg,
        status.color,
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={cn(
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
            status.color.replace("text-", "bg-")
          )}
        />
        <span
          className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            status.color.replace("text-", "bg-")
          )}
        />
      </span>
      {status.text}
    </span>
  );
}

