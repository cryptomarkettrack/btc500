import { useEffect, useRef, useState } from "react";

interface CounterRollProps {
  /** The figure to land on. */
  value: number;
  /** Digits after the decimal point. */
  decimals?: number;
  /** Suffix rendered after the figure (e.g. "%" or "/4"). */
  suffix?: string;
  /** Prefix rendered before the figure (e.g. "+"). */
  prefix?: string;
  className?: string;
  durationMs?: number;
}

/**
 * The "counter-rolls" moment from taste-skill: a proof figure rolls up once
 * when the row comes on screen, the right-most digit turning most, and rests on
 * the real number. It never re-runs on scroll and never reads as zeros.
 */
export function CounterRoll({
  value,
  decimals = 0,
  suffix,
  prefix,
  className,
  durationMs = 1100,
}: CounterRollProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState<number | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      setShown(value);
      return;
    }

    let frame = 0;
    let start = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const tick = (now: number) => {
          if (!start) start = now;
          const t = Math.min(1, (now - start) / durationMs);
          // easeOutExpo: fast first, then settles on the figure.
          const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          setShown(value * eased);
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, durationMs]);

  const text =
    shown === null
      ? "0"
      : shown.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });

  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}
