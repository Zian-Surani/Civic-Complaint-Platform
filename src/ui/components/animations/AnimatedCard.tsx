import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hoverScale?: number;
  glowColor?: string;
}

export function AnimatedCard({
  children,
  className = "",
  delay = 0,
  hoverScale = 1.02,
  glowColor,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ 
        scale: hoverScale,
        boxShadow: glowColor 
          ? `0 20px 40px -10px ${glowColor}` 
          : "0 20px 40px -10px rgb(0 0 0 / 0.15)"
      }}
      className={`rounded-2xl border border-border/50 bg-card p-6 shadow-soft-md transition-colors ${className}`}
    >
      {children}
    </motion.div>
  );
}
