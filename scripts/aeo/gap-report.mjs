/**
 * Pure gap analysis for the AEO prompt ledger. No I/O, so it is unit-testable.
 *
 * Granola's diagnosis order for every missed recommendation:
 *   1. which competitors appeared instead of us?
 *   2. which sources did the engine cite?
 *   3. what did those sources answer?
 *   4. only then decide: missing information, weak coverage, or offsite consensus.
 */

export const GAP_TYPES = Object.freeze({
  "missing-information":
    "No answer surface exists for this decision — write it on an existing page.",
  "weak-coverage":
    "We have a surface, but the engine prefers another source — make the answer clearer and more citable.",
  "offsite-consensus":
    "Independent sources dominate and do not mention us — earn reviews, mentions and comparisons.",
  unmeasured: "No observation recorded yet — run the prompt before drawing a conclusion.",
});

export const NEXT_ACTIONS = Object.freeze({
  "missing-information":
    "Update or add an answer block on the existing owning surface (no new URL without a GSC impression row).",
  "weak-coverage":
    "Tighten the answer-first block, comparison table and schema on the owning surface, then retest.",
  "offsite-consensus":
    "Build an EARN asset and pitch the sources the engine already cites; retest after coverage lands.",
  unmeasured: "Add an observation to scripts/aeo/prompt-results.json for this prompt.",
});

/** Latest observation per question id, keyed by observedAt then engine. */
export function latestByQuestion(results = []) {
  const latest = new Map();
  for (const r of results) {
    if (!r || !r.questionId || !r.observedAt) continue;
    const prev = latest.get(r.questionId);
    if (!prev || r.observedAt > prev.observedAt) latest.set(r.questionId, r);
  }
  return latest;
}

/**
 * Classify one observed result. A miss on an EARN decision is an offsite
 * consensus problem; a miss where we own a surface is weak coverage. A hit is
 * recorded but never called a win until the next repeat confirms it.
 */
export function classify(question, result) {
  if (!result) return "unmeasured";
  if (result.brandPresent) return "present";
  if (question.frame === "EARN") return "offsite-consensus";
  if ((result.citedSources ?? []).length && (result.competitors ?? []).length)
    return "weak-coverage";
  return "missing-information";
}

export function buildGapReport(map = [], results = []) {
  const latest = latestByQuestion(results);
  const rows = map.map((q) => {
    const result = latest.get(q.id) ?? null;
    const type = classify(q, result);
    return {
      id: q.id,
      frame: q.frame,
      question: q.question,
      aiPrompt: q.aiPrompt,
      observedAt: result?.observedAt ?? null,
      engine: result?.engine ?? null,
      brandPresent: result?.brandPresent ?? null,
      competitors: result?.competitors ?? [],
      citedSources: result?.citedSources ?? [],
      note: result?.note ?? "",
      type,
      diagnosis: GAP_TYPES[type] ?? "",
      nextAction: NEXT_ACTIONS[type] ?? "",
    };
  });
  const missed = rows.filter((r) => r.brandPresent === false);
  const unmeasured = rows.filter((r) => r.type === "unmeasured");
  const present = rows.filter((r) => r.brandPresent === true);
  const trustedSources = [...new Set(rows.flatMap((r) => r.citedSources).filter(Boolean))].sort();
  return { rows, missed, unmeasured, present, trustedSources };
}
