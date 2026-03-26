import { cn } from "../../lib/utils";
import { CSSProperties } from "react";

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-muted/60",
        className
      )}
      style={style}
    />
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function SkeletonStatCard({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card p-5 space-y-3", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonListItem({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-xl border border-border/50 p-4 flex items-center gap-4", className)}>
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

export function SkeletonChart({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <div className="h-[280px] flex items-end gap-2 pt-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-lg"
            style={{ height: `${Math.random() * 60 + 40}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, className }: SkeletonProps & { rows?: number }) {
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card overflow-hidden", className)}>
      <div className="border-b border-border/50 bg-muted/30 px-6 py-3 flex gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-border/50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex gap-6">
            {Array.from({ length: 5 }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
