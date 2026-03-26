import { motion } from "framer-motion";

interface FloatingElementsProps {
  className?: string;
}

export function FloatingElements({ className = "" }: FloatingElementsProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Large gradient orb */}
      <motion.div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, hsl(217 91% 50% / 0.4) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Secondary orb */}
      <motion.div
        className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, hsl(172 66% 40% / 0.5) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, -20, 0],
          y: [0, 30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Accent orb */}
      <motion.div
        className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, hsl(234 89% 64% / 0.5) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, 40, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Small floating particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary/20"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
}
