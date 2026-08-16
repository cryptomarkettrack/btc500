/**
 * Shared load/completeness status for historical and live datasets.
 * Incomplete data must stay visible as incomplete — never look finished.
 */

export type Completeness = "complete" | "partial" | "empty";

export type DataLoadStatus = "ok" | "partial" | "unavailable" | "error";

export type DataErrorCode = "unavailable" | "upstream" | "malformed" | "unknown";

export interface DataLoadError {
  code: DataErrorCode;
  /** Safe to show in the UI. Never a stack trace. */
  message: string;
}

export interface DataResult<T> {
  data: T;
  completeness: Completeness;
  source: string;
  missingDates: string[];
}

export function completenessFromCounts(expected: number, actual: number): Completeness {
  if (expected <= 0 || actual <= 0) return actual <= 0 ? "empty" : "partial";
  if (actual >= expected) return "complete";
  return "partial";
}

export function statusFromCompleteness(completeness: Completeness): DataLoadStatus {
  if (completeness === "complete") return "ok";
  if (completeness === "partial") return "partial";
  return "unavailable";
}

export function userSafeDataError(
  code: DataErrorCode,
  message = "Historical data could not be loaded.",
): DataLoadError {
  return { code, message };
}
