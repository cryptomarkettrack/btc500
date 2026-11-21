import { useEffect, useState } from "react";
import { getRouteApi, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, ArrowDownRight, Clock, Info, Lock, Trophy } from "lucide-react";

import { CandleChart } from "@/components/clash/CandleChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocalTime } from "@/hooks/use-local-time";
import { submitPredictionFn } from "@/lib/clash/functions";
import type { ClashState } from "@/lib/clash/service";
import type { Direction } from "@/lib/clash/rules";

const route = getRouteApi("/clash");

const REJECTIONS: Record<string, string> = {
  unavailable: "Candle Clash is not connected to a database yet.",
  "database-not-migrated": "Database connected, but tables are missing. Run bun run db:migrate.",
  "bad-market": "That market is not available in this MVP.",
  closed: "Predictions for this candle are closed. Wait for the next one.",
  "no-price": "Exchange data is unavailable, so nothing was submitted. Please try again.",
  duplicate: "You already have a prediction for this candle.",
};

function countdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function statusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  if (status === "WON") return "default";
  if (status === "LOST") return "secondary";
  if (status === "VOID") return "outline";
  return "destructive";
}

function statusLabel(status: string): string {
  if (status === "PENDING") return "Pending";
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function IdentityCard({ state }: { state: ClashState }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Your player</CardTitle>
        <CardDescription>
          Email and username are used to rank you. No password, no signup.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state.player ? (
          <div className="space-y-2 text-sm">
            <p>
              Playing as <span className="font-semibold">{state.player.username}</span>
            </p>
            <p className="break-all text-muted-foreground">{state.player.email}</p>
            <p className="text-xs text-muted-foreground">
              {state.player.emailOptIn
                ? "You opted in to occasional product emails."
                : "No emails — your details are only used for ranking."}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Enter your email and username, then press UP or DOWN to start playing.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function RulesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Rules</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>
          One prediction per 15-minute BTC/USDT candle, locked in at least 60s before it closes.
        </p>
        <p>
          Settled from Binance&apos;s official candle open and close: +1 for correct, 0 for wrong, 0
          for a flat candle (VOID).
        </p>
        <p>Free to play. No wagers, deposits or prizes.</p>
      </CardContent>
    </Card>
  );
}

export function ClashPage() {
  const state = route.useLoaderData();
  const router = useRouter();
  const submit = useServerFn(submitPredictionFn);
  const { formatTime, timeZone } = useLocalTime();
  // Seed the clock from the loader snapshot so SSR and the first client render
  // agree; only start ticking after hydration.
  const [nowMs, setNowMs] = useState(state.now);
  useEffect(() => {
    setNowMs(Date.now());
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [emailOptIn, setEmailOptIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<Direction | null>(null);

  // Move to the next candle as soon as the current one closes.
  useEffect(() => {
    const delay = Math.max(0, state.target.closeTime - Date.now()) + 750;
    const id = setTimeout(() => router.invalidate(), delay);
    return () => clearTimeout(id);
  }, [state.target.closeTime, router]);

  async function predict(direction: Direction) {
    setError(null);
    setBusy(direction);
    try {
      const identity = state.player
        ? {
            username: state.player.username,
            email: state.player.email,
            emailOptIn: state.player.emailOptIn,
          }
        : { username, email, emailOptIn };
      const result = await submit({
        data: {
          ...identity,
          direction,
          symbol: state.target.symbol,
          timeframe: state.target.timeframe,
        },
      });
      if (!result.ok) {
        setError(REJECTIONS[result.reason] ?? "Could not submit that prediction.");
        return;
      }
      await router.invalidate();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not submit that prediction.");
    } finally {
      setBusy(null);
    }
  }

  if (!state.available) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Candle Clash is not configured yet</CardTitle>
            <CardDescription>
              {state.reason === "database-not-migrated"
                ? 'The database is connected, but its tables do not exist. Run "bun run db:migrate" with the same DATABASE_URL the app uses, then reload. See CLASH_SETUP.md.'
                : "Connect Neon PostgreSQL, set DATABASE_URL and CLASH_COOKIE_SECRET, then run the migration. See CLASH_SETUP.md."}
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const msToClose = Math.max(0, state.target.closeTime - nowMs);
  const msToCutoff = Math.max(0, state.target.cutoffTime - nowMs);
  const canPredict = state.target.windowOpen && msToCutoff > 0 && !state.hasPredictedCurrent;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 max-w-2xl">
        <Badge className="mb-3 bg-orange-500 text-white hover:bg-orange-500">Free to play</Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Candle Clash</h1>
        <p className="mt-3 text-base text-muted-foreground">
          Will the next BTC/USDT candle close up or down? Call it before the cutoff, then watch the
          result settle from verified exchange data.
        </p>
      </header>

      <div className="mb-6">
        <CandleChart
          candles={state.candles}
          liveOpenTime={state.target.openTime}
          formatTime={formatTime}
          timeZone={timeZone}
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">BTC / USDT · 15m</CardTitle>
                  <CardDescription>
                    Candle opens {formatTime(state.target.openTime)}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Closes in
                  </p>
                  <p className="font-mono text-xl tabular-nums">{countdown(msToClose)}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-baseline justify-between rounded-lg bg-muted/50 p-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Reference price
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">
                    {state.price === null
                      ? "—"
                      : `$${state.price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
                  </p>
                </div>
                <p className="max-w-[11rem] text-right text-xs text-muted-foreground">
                  Server-observed candle open. Informational only.
                </p>
              </div>

              {!state.player && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-xs font-medium">Username</span>
                    <Input
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="satoshi"
                      maxLength={24}
                      autoComplete="nickname"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-xs font-medium">Email</span>
                    <Input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      maxLength={254}
                      autoComplete="email"
                    />
                  </label>
                  <label className="flex items-start gap-2 text-xs text-muted-foreground sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={emailOptIn}
                      onChange={(event) => setEmailOptIn(event.target.checked)}
                      className="mt-0.5 size-4 rounded border-input accent-orange-500"
                    />
                    <span>
                      Email me occasional BTC500 updates (optional). Without this, your email is
                      only used to identify your ranking.
                    </span>
                  </label>
                </div>
              )}

              {error && (
                <p
                  role="alert"
                  className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
                >
                  {error}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  disabled={!canPredict || busy !== null}
                  onClick={() => predict("UP")}
                  className="h-16 border-emerald-500/40 text-base text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-400"
                >
                  <ArrowUpRight className="size-5" />
                  {busy === "UP" ? "Submitting…" : "UP"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  disabled={!canPredict || busy !== null}
                  onClick={() => predict("DOWN")}
                  className="h-16 border-red-500/40 text-base text-red-600 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400 dark:hover:text-red-400"
                >
                  <ArrowDownRight className="size-5" />
                  {busy === "DOWN" ? "Submitting…" : "DOWN"}
                </Button>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {state.hasPredictedCurrent ? (
                  <>
                    <Lock className="size-3.5" /> Prediction locked in for this candle.
                  </>
                ) : msToCutoff === 0 ? (
                  <>
                    <Clock className="size-3.5" /> Calling closed — next candle opens in{" "}
                    {countdown(msToClose)}.
                  </>
                ) : (
                  <>
                    <Clock className="size-3.5" /> Predictions close in {countdown(msToCutoff)}.
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your predictions</CardTitle>
              <CardDescription>Most recent first · times in {timeZone}</CardDescription>
            </CardHeader>
            <CardContent>
              {state.history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No predictions yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                        <th className="py-2 pr-3 font-medium">Candle</th>
                        <th className="py-2 pr-3 font-medium">Call</th>
                        <th className="py-2 pr-3 font-medium">Status</th>
                        <th className="py-2 pr-3 text-right font-medium">Entry</th>
                        <th className="py-2 text-right font-medium">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.history.map((row) => (
                        <tr key={row.id} className="border-b last:border-0">
                          <td className="py-2 pr-3 font-mono tabular-nums">
                            {formatTime(row.candleOpenTime)}
                          </td>
                          <td className="py-2 pr-3 font-semibold">{row.direction}</td>
                          <td className="py-2 pr-3">
                            <Badge variant={statusVariant(row.status)}>
                              {statusLabel(row.status)}
                            </Badge>
                          </td>
                          <td className="py-2 pr-3 text-right tabular-nums text-muted-foreground">
                            {row.entryPrice === null
                              ? "—"
                              : `$${row.entryPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
                          </td>
                          <td className="py-2 text-right font-semibold tabular-nums">
                            +{row.points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <IdentityCard state={state} />

          <div className="grid grid-cols-3 gap-3">
            <Stat
              label="Accuracy"
              value={
                state.stats.accuracy === null ? "—" : `${Math.round(state.stats.accuracy * 100)}%`
              }
              hint={state.stats.settled > 0 ? `n=${state.stats.settled}` : "no results yet"}
            />
            <Stat label="Streak" value={String(state.stats.currentStreak)} hint="current" />
            <Stat label="Best" value={String(state.stats.bestStreak)} hint="all time" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="size-4 text-orange-500" /> Leaderboard
              </CardTitle>
              <CardDescription>All time · points, then accuracy, then sample size</CardDescription>
            </CardHeader>
            <CardContent>
              {state.leaderboard.length === 0 ? (
                <p className="text-sm text-muted-foreground">No settled predictions yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                        <th className="py-2 pr-3 font-medium">#</th>
                        <th className="py-2 pr-3 font-medium">Player</th>
                        <th className="py-2 pr-3 text-right font-medium">Points</th>
                        <th className="py-2 text-right font-medium">Accuracy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.leaderboard.map((row) => (
                        <tr key={row.rank} className="border-b last:border-0">
                          <td className="py-2 pr-3 font-mono tabular-nums text-muted-foreground">
                            {row.rank}
                          </td>
                          <td className="py-2 pr-3 font-medium">{row.username}</td>
                          <td className="py-2 pr-3 text-right font-semibold tabular-nums">
                            {row.points}
                          </td>
                          <td className="py-2 text-right tabular-nums text-muted-foreground">
                            {row.settled
                              ? `${Math.round((row.wins / row.settled) * 100)}% (n=${row.settled})`
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-4 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" />
            <p>
              Identity is lightweight: anyone who knows your email can reuse it, so leaderboards are
              not abuse-resistant. Emails are stored only if you opt in, and no email is sent by the
              MVP.
            </p>
          </div>

          <RulesCard />
        </aside>
      </div>
    </main>
  );
}
