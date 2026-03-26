import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "./button";
import { cn } from "../../lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  variant?: "default" | "subtle" | "card";
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "default",
  className,
  children,
}: EmptyStateProps) {
  const variants = {
    default: "py-16",
    subtle: "py-12",
    card: "py-20 rounded-2xl border border-dashed border-border/60 bg-muted/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        variants[variant],
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="relative"
      >
        {/* Decorative ring */}
        <div className="absolute inset-0 animate-pulse-glow">
          <div className="h-full w-full rounded-3xl bg-gradient-to-br from-primary/10 to-accent-indigo/10 blur-xl" />
        </div>
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-muted to-muted/50 shadow-soft-md">
          <Icon className="h-9 w-9 text-muted-foreground" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mt-6 space-y-2"
      >
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      </motion.div>

      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mt-6"
        >
          {action.href ? (
            <Button asChild className="rounded-xl btn-premium">
              <a href={action.href}>{action.label}</a>
            </Button>
          ) : (
            <Button onClick={action.onClick} className="rounded-xl btn-premium">
              {action.label}
            </Button>
          )}
        </motion.div>
      )}

      {children && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="mt-6"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}

