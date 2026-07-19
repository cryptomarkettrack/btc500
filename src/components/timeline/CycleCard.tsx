import { motion } from "framer-motion";
import { AnimatedNumber } from "./AnimatedNumber";
import { TimelineSlider } from "./TimelineSlider";
import type { TimelineDay, TimelineCycle } from "@/lib/timeline.functions";

interface CycleCardProps {
  cycle: TimelineCycle;
  selectedDay: TimelineDay;
  onDayChange: (day: TimelineDay) => void;
  title: string;
  showToday?: boolean;
  showSell?: boolean;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function CycleCard({
  cycle,
  selectedDay,
  onDayChange,
  title,
  showToday = false,
  showSell = false,
}: CycleCardProps) {
  const isPositive = selectedDay.profitLoss >= 0;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-[32px] border border-border/60 bg-card p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-10"
    >
      {/* Title */}
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </div>
        <div className="mt-1 text-2xl font-bold tracking-tight">
          {formatDate(cycle.buyDate)}
          <span className="mx-2 text-muted-foreground/40">→</span>
          {showToday ? "Today" : formatDate(cycle.sellDate)}
        </div>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3">
        <Stat label="Date" value={formatDate(selectedDay.date)} />
        <Stat
          label="BTC Price"
          value={
            <AnimatedNumber value={selectedDay.price} isCurrency className="text-lg font-bold" />
          }
        />
        <Stat
          label="BTC Purchased"
          value={
            <AnimatedNumber
              value={selectedDay.btcPurchased}
              decimals={5}
              className="text-lg font-bold"
            />
          }
        />
        <Stat
          label="Portfolio"
          value={
            <AnimatedNumber
              value={selectedDay.portfolioValue}
              isCurrency
              className="text-lg font-bold"
            />
          }
        />
        <Stat
          label={isPositive ? "Profit" : "Loss"}
          value={
            <span
              className={`text-lg font-bold ${isPositive ? "text-success" : "text-destructive"}`}
            >
              <AnimatedNumber value={selectedDay.profitLoss} isCurrency />
            </span>
          }
        />
        <Stat
          label="ROI"
          value={
            <span
              className={`text-lg font-bold ${isPositive ? "text-success" : "text-destructive"}`}
            >
              <AnimatedNumber value={selectedDay.roiPercent} isPercent />
            </span>
          }
        />
      </div>

      {/* Details row */}
      <div className="mb-8 flex flex-col gap-1 text-sm text-muted-foreground">
        <span>
          Day <span className="font-semibold text-foreground">{selectedDay.dayIndex}</span> since
          buy
        </span>
        {selectedDay.daysUntilHalving !== null && (
          <span>
            <span className="font-semibold text-amber-600">{selectedDay.daysUntilHalving}</span>{" "}
            days until halving
          </span>
        )}
        {selectedDay.daysAfterHalving !== null && (
          <span>
            <span className="font-semibold text-amber-600">{selectedDay.daysAfterHalving}</span>{" "}
            days after halving
          </span>
        )}
      </div>

      {/* Timeline slider */}
      <TimelineSlider
        cycle={cycle}
        selectedDay={selectedDay}
        onDayChange={onDayChange}
        showToday={showToday}
        showSell={showSell}
      />
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1">{value}</div>
    </div>
  );
}
