import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "elevated" | "outlined" | "matte";
  hover?: boolean;
  animated?: boolean;
}

const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ className, variant = "default", hover = false, animated = false, style, ...props }, ref) => {
    const variants = {
      default: "bg-card border border-border/50 shadow-soft-sm",
      glass: "glass-card",
      elevated: "bg-card border-0 shadow-soft-lg",
      outlined: "bg-transparent border border-border",
      matte: "matte-card",
    };

    const baseClasses = cn(
      "rounded-2xl transition-all duration-300",
      variants[variant],
      hover && "card-hover cursor-pointer",
      className
    );

    if (animated) {
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
          className={baseClasses}
          style={style}
          {...(props as any)}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={baseClasses}
        style={style}
        {...props}
      />
    );
  }
);
PremiumCard.displayName = "PremiumCard";

const PremiumCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-5 pb-3", className)}
    {...props}
  />
));
PremiumCardHeader.displayName = "PremiumCardHeader";

const PremiumCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
PremiumCardTitle.displayName = "PremiumCardTitle";

const PremiumCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
PremiumCardDescription.displayName = "PremiumCardDescription";

const PremiumCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
));
PremiumCardContent.displayName = "PremiumCardContent";

const PremiumCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-5 pt-0", className)}
    {...props}
  />
));
PremiumCardFooter.displayName = "PremiumCardFooter";

export {
  PremiumCard,
  PremiumCardHeader,
  PremiumCardTitle,
  PremiumCardDescription,
  PremiumCardContent,
  PremiumCardFooter,
};
