import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
type SeverityLevel = string;
type ComplaintStatus = string;

interface SeverityBadgeProps {
  severity: SeverityLevel;
  showScore?: boolean;
  score?: number;
  className?: string;
}

export function SeverityBadge({ severity, showScore, score, className }: SeverityBadgeProps) {
  const severityConfig: Record<SeverityLevel, { label: string; className: string }> = {
    critical: { 
      label: 'Critical', 
      className: 'bg-[hsl(var(--severity-critical))] text-[hsl(var(--severity-critical-foreground))] hover:bg-[hsl(var(--severity-critical))]' 
    },
    high: { 
      label: 'High', 
      className: 'bg-[hsl(var(--severity-high))] text-[hsl(var(--severity-high-foreground))] hover:bg-[hsl(var(--severity-high))]' 
    },
    medium: { 
      label: 'Medium', 
      className: 'bg-[hsl(var(--severity-medium))] text-[hsl(var(--severity-medium-foreground))] hover:bg-[hsl(var(--severity-medium))]' 
    },
    low: { 
      label: 'Low', 
      className: 'bg-[hsl(var(--severity-low))] text-[hsl(var(--severity-low-foreground))] hover:bg-[hsl(var(--severity-low))]' 
    },
    very_low: { 
      label: 'Very Low', 
      className: 'bg-[hsl(var(--severity-very-low))] text-[hsl(var(--severity-very-low-foreground))] hover:bg-[hsl(var(--severity-very-low))]' 
    },
  };

  const config = severityConfig[severity as keyof typeof severityConfig] ?? severityConfig.medium;

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
      {showScore && score !== undefined && ` (${score})`}
    </Badge>
  );
}

interface StatusBadgeProps {
  status: ComplaintStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    Raised: { 
      label: 'Raised', 
      className: 'bg-[hsl(var(--status-pending-bg))] text-[hsl(var(--status-pending))] border-[hsl(var(--status-pending))]' 
    },
    Assigned: { 
      label: 'Assigned', 
      className: 'bg-[hsl(var(--status-assigned-bg))] text-[hsl(var(--status-assigned))] border-[hsl(var(--status-assigned))]' 
    },
    In_Progress: { 
      label: 'In Progress', 
      className: 'bg-[hsl(var(--status-in-progress-bg))] text-[hsl(var(--status-in-progress))] border-[hsl(var(--status-in-progress))]' 
    },
    Resolved: { 
      label: 'Resolved', 
      className: 'bg-[hsl(var(--status-resolved-bg))] text-[hsl(var(--status-resolved))] border-[hsl(var(--status-resolved))]' 
    },
    Closed: { 
      label: 'Closed', 
      className: 'bg-[hsl(var(--status-closed-bg))] text-[hsl(var(--status-closed))] border-[hsl(var(--status-closed))]' 
    },
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
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

interface RoleBadgeProps {
  role: 'citizen' | 'authority' | 'admin';
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const roleConfig: Record<string, { label: string; className: string }> = {
    citizen: { 
      label: 'Citizen', 
      className: 'bg-[hsl(var(--role-citizen-bg))] text-[hsl(var(--role-citizen))] border-[hsl(var(--role-citizen))]' 
    },
    authority: { 
      label: 'Authority', 
      className: 'bg-[hsl(var(--role-authority-bg))] text-[hsl(var(--role-authority))] border-[hsl(var(--role-authority))]' 
    },
    admin: { 
      label: 'Admin', 
      className: 'bg-[hsl(var(--role-admin-bg))] text-[hsl(var(--role-admin))] border-[hsl(var(--role-admin))]' 
    },
  };

  const config = roleConfig[role];

  return (
    <Badge variant="outline" className={cn(config.className, 'capitalize', className)}>
      {config.label}
    </Badge>
  );
}
