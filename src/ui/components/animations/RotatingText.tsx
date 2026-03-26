import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RotatingTextProps {
  texts: string[];
  interval?: number;
  className?: string;
}

export function RotatingText({ texts, interval = 3000, className = "" }: RotatingTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, interval);

    return () => clearInterval(timer);
  }, [texts.length, interval]);

  return (
    <span className={`relative inline-block ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, y: -20, rotateX: 90 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-block text-gradient"
        >
          {texts[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
