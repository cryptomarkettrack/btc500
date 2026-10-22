interface RouteDataErrorProps {
  // TanStack Router types route errors as `unknown` since 1.170.4x.
  error: unknown;
  message?: string;
}

function errorText(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Something went wrong.";
}

/**
 * Shared route error UI when live data is temporarily unavailable.
 */
export function RouteDataError({
  error,
  message = "Data updating…",
}: RouteDataErrorProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-8 text-center">
      <div>
        <p className="text-sm text-muted-foreground">{message}</p>
        <p className="mt-2 text-xs text-muted-foreground/70">{errorText(error)}</p>
      </div>
    </div>
  );
}

export function RouteNotFound() {
  return <div className="p-8">Not found</div>;
}
