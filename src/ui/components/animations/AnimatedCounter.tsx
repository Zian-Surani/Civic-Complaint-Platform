import { useEffect, useState, useRef } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function AnimatedCounter({
  value,
  duration = 1500,
  className = "",
  prefix = "",
  suffix = "",
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = countRef.current;
    if (!element) {
      setCount(value);
      return;
    }

    const start = Number.isFinite(count) ? count : 0;
    animateValue(start, value, duration);
  }, [value, duration]);

  const animateValue = (start: number, end: number, dur: number) => {
    const startTime = performance.now();
    
    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / dur, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (end - start) * easeOutQuart);
      
      setCount(current);
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    
    requestAnimationFrame(update);
  };

  return (
    <span ref={countRef} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}
