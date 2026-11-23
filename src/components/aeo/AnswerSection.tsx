import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A direct, quotable answer at the top of a page — the unit AEO works on.
 *
 * Rules for callers:
 *   - `question` is a real question a reader asks, in their words.
 *   - `answer` is the answer in the FIRST sentence, derived from live data or
 *     an on-page table. No "in this article we will explore".
 *   - `detail` carries the caveat or the method, never the headline claim.
 *   - The `.lead` class makes the answer a SpeakableSpecification target on
 *     every route whose head already points at `.lead`.
 */
interface AnswerSectionProps {
  id?: string;
  question: string;
  answer: ReactNode;
  detail?: ReactNode;
  source?: { href: string; label: string } | null;
  children?: ReactNode;
  className?: string;
}

export function AnswerSection({
  id = "answer",
  question,
  answer,
  detail,
  source,
  children,
  className,
}: AnswerSectionProps) {
  return (
    <section
      id={id}
      aria-label={question}
      className={cn("rounded-[24px] border border-primary/20 bg-card p-6 sm:p-8", className)}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        Direct answer
      </p>
      <h2 id={`${id}-heading`} className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
        {question}
      </h2>
      <p className="lead mt-3 text-base leading-relaxed text-foreground">{answer}</p>
      {detail && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{detail}</p>}
      {children}
      {source && (
        <p className="mt-4 text-sm">
          <a href={source.href} className="font-semibold text-primary hover:underline">
            {source.label}
          </a>
        </p>
      )}
    </section>
  );
}
