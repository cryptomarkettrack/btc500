import { useCallback, useRef } from "react";
import { motion } from "framer-motion";
import type { TimelineDay, TimelineCycle } from "@/lib/timeline.functions";

interface TimelineSliderProps {
  cycle: TimelineCycle;
  selectedDay: TimelineDay;
  onDayChange: (day: TimelineDay) => void;
  showToday?: boolean;
  showSell?: boolean;
}

export function TimelineSlider({
  cycle,
  selectedDay,
  onDayChange,
  showToday = false,
  showSell = false,
}: TimelineSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const days = cycle.days;
  const totalDays = days.length;
  const currentIndex = days.findIndex((d) => d.date === selectedDay.date);

  const getDayFromPercent = useCallback(
    (percent: number) => {
      const index = Math.round((percent / 100) * (totalDays - 1));
      return days[Math.max(0, Math.min(index, totalDays - 1))];
    },
    [days, totalDays],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!trackRef.current) return;
      e.preventDefault();

      // Capture pointer for reliable tracking
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      const rect = trackRef.current.getBoundingClientRect();
      const percent = ((e.clientX - rect.left) / rect.width) * 100;
      const day = getDayFromPercent(percent);
      onDayChange(day);

      const handleMove = (e: PointerEvent) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        const day = getDayFromPercent(percent);
        onDayChange(day);
      };

      const handleUp = () => {
        if (trackRef.current) {
          trackRef.current.releasePointerCapture(e.pointerId);
        }
        document.removeEventListener("pointermove", handleMove);
        document.removeEventListener("pointerup", handleUp);
      };

      document.addEventListener("pointermove", handleMove);
      document.addEventListener("pointerup", handleUp);
    },
    [getDayFromPercent, onDayChange],
  );

  const percent = totalDays > 1 ? (currentIndex / (totalDays - 1)) * 100 : 0;

  // Milestone positions
  const buyPercent = 0;
  const halvingIndex = days.findIndex((d) => d.daysUntilHalving === 0);
  const halvingPercent = halvingIndex >= 0 ? (halvingIndex / (totalDays - 1)) * 100 : 50;
  const todayIndex = showToday ? days.length - 1 : -1;
  const todayPercent = todayIndex >= 0 ? (todayIndex / (totalDays - 1)) * 100 : 100;
  const sellPercent = 100;

  return (
    <div className="w-full">
      {/* Timeline track */}
      <div
        ref={trackRef}
        className="relative h-16 cursor-pointer select-none"
        onPointerDown={handlePointerDown}
        style={{ touchAction: "none" }}
      >
        {/* Background track */}
        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted" />

        {/* Filled track */}
        <motion.div
          className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
          style={{ width: `${percent}%` }}
          layout
          transition={{ duration: 0.3, ease: "easeOut" }}
        />

        {/* Milestone markers */}
        {/* Buy marker */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${buyPercent}%` }}
        >
          <div className="flex flex-col items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-primary shadow-sm" />
            <span className="mt-6 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-primary">
              Buy
            </span>
          </div>
        </div>

        {/* Halving marker */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${halvingPercent}%` }}
        >
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 shadow-sm">
              <span className="text-[8px] font-bold text-white">▲</span>
            </div>
            <span className="mt-5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-amber-600">
              Halving
            </span>
          </div>
        </div>

        {/* Today marker (current cycle only) */}
        {showToday && (
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${todayPercent}%` }}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-success shadow-sm" />
              <span className="mt-6 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-success">
                Today
              </span>
            </div>
          </div>
        )}

        {/* Sell marker (previous cycle only) */}
        {showSell && (
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${sellPercent}%` }}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-destructive shadow-sm" />
              <span className="mt-6 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-destructive">
                Sell
              </span>
            </div>
          </div>
        )}

        {/* Draggable thumb */}
        <motion.div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${percent}%` }}
          layout
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow-[0_2px_8px_rgba(0,0,0,0.15)] ring-2 ring-background">
            <div className="h-2 w-2 rounded-full bg-white" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
