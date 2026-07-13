import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import type { CSSProperties } from "react";

interface AnimatedNumberProps {
  value: number;
  format?: (n: number) => string;
  className?: string;
  style?: CSSProperties;
  prefix?: string;
  suffix?: string;
  isCurrency?: boolean;
  isPercent?: boolean;
  decimals?: number;
  /** If set, the animation will start from this value on first mount instead of the current value */
  initialValue?: number;
}

function defaultFormat(n: number, decimals = 2): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function AnimatedNumber({
  value,
  format,
  className = "",
  style,
  prefix = "",
  suffix = "",
  isCurrency = false,
  isPercent = false,
  decimals = 2,
  initialValue,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(
    initialValue !== undefined ? initialValue : value,
  );
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const fromRef = useRef(initialValue !== undefined ? initialValue : value);
  const toRef = useRef(value);
  const initializedRef = useRef(initialValue === undefined);
  const duration = 5000; // ms — slow, dramatic countdown effect

  useEffect(() => {
    fromRef.current = displayValue;
    toRef.current = value;
    startRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = fromRef.current + (toRef.current - fromRef.current) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value]);

  const formatted = format
    ? format(displayValue)
    : isCurrency
      ? displayValue.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        })
      : isPercent
        ? `${displayValue >= 0 ? "+" : ""}${defaultFormat(displayValue, 1)}%`
        : defaultFormat(displayValue, decimals);

  return (
    <motion.span
      className={className}
      style={style}
      initial={false}
      layout
      transition={{ duration: 0.2 }}
    >
      {prefix}
      {formatted}
      {suffix}
    </motion.span>
  );
}
