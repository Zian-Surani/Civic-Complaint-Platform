import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
      when: "beforeChildren" as const,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: "easeOut" as const,
    },
  },
};

const childVariants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
    },
  },
};

export function PageTransition({ children, className }: PageTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function AnimatedSection({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      variants={childVariants}
      initial="initial"
      animate="enter"
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeInView({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleOnHover({ children, className, scale = 1.02 }: { children: ReactNode; className?: string; scale?: number }) {
  return (
    <motion.div
      whileHover={{ scale, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
