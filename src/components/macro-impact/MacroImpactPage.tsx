import { motion } from "framer-motion";
import { BarChart3, Construction } from "lucide-react";

interface MacroImpactPageProps {
  initialData: null;
}

export function MacroImpactPage({}: MacroImpactPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 pb-24 pt-10 sm:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center"
        >
          {/* Icon */}
          <span className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 ring-1 ring-amber-500/20">
            <Construction className="h-8 w-8 text-amber-400" />
          </span>

          {/* Badge */}
          <span className="mb-4 inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
            Coming Soon
          </span>

          {/* Title */}
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Macro Impact
          </h1>

          {/* Description */}
          <p className="mb-2 max-w-lg text-lg text-muted-foreground">
            We're rebuilding our data pipeline for more accurate CPI & PPI analysis.
          </p>
          <p className="max-w-md text-sm text-muted-foreground/60">
            This page will be filled with real historical data soon. Stay tuned.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
