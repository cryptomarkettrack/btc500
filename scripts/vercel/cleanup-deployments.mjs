/**
 * Reclaim Vercel deployment storage by deleting old production deployments.
 *
 * The growth runner pushes to `main` several times a day, and Vercel retains
 * every production deployment. This script keeps the most recent ones plus any
 * deployment that is still aliased, promoted or young, and deletes the rest.
 *
 * Usage (from the repo root):
 *
 *   VERCEL_TOKEN=... node scripts/vercel/cleanup-deployments.mjs
 *   VERCEL_TOKEN=... node scripts/vercel/cleanup-deployments.mjs --keep=10 --older-than-days=7
 *   VERCEL_TOKEN=... node scripts/vercel/cleanup-deployments.mjs --apply
 *
 * Dry run is the default. Nothing is deleted without --apply. A production
 * token is required; never paste it into a command that gets committed.
 *
 * Deleting a deployment removes instant-rollback for it and can break links
 * that point at a specific deployment URL. Review the dry-run list first.
 */

const API = "https://api.vercel.com";

function arg(name, fallback) {
  const prefix = `--${name}=`;
  const found = process.argv.find((a) => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

const keep = Math.max(1, Number(arg("keep", "8")) || 8);
const olderThanDays = Math.max(0, Number(arg("older-than-days", "3")) || 3);
const project = arg("project", "btc500");
const slug = arg("slug", "cryptomarkettracks-projects");
const apply = process.argv.includes("--apply");
const token = process.env.VERCEL_TOKEN;

if (!token) {
  console.error("Set VERCEL_TOKEN to a Vercel access token with access to this team.");
  process.exit(1);
}

async function api(path) {
  const url = new URL(`${API}${path}`);
  url.searchParams.set("slug", slug);
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${body.slice(0, 500)}`);
  }
  return response.json();
}

async function listDeployments() {
  const all = [];
  let until;
  for (;;) {
    const params = new URLSearchParams({
      projectId: project,
      target: "production",
      state: "READY",
      limit: "100",
    });
    if (until) params.set("until", String(until));

    const page = await api(`/v7/deployments?${params}`);
    all.push(...(page.deployments ?? []));
    until = page.pagination?.next;
    if (!until || !(page.deployments ?? []).length) break;
  }
  // Already-deleted/expired deployments would only produce 404s on DELETE.
  return all.filter((d) => !d.deleted && !d.softDeletedByRetention);
}

const ageCutoff = Date.now() - olderThanDays * 86_400_000;
const deployments = await listDeployments();
const sorted = [...deployments].sort(
  (a, b) => Number(b.created ?? b.createdAt ?? 0) - Number(a.created ?? a.createdAt ?? 0),
);

const protectedIds = new Set(sorted.slice(0, keep).map((d) => d.uid));
const reasons = new Map();

for (const d of sorted) {
  const id = d.uid;
  const created = Number(d.created ?? d.createdAt ?? 0);
  if (protectedIds.has(id)) reasons.set(id, `one of the ${keep} newest`);
  else if (created > ageCutoff) reasons.set(id, `younger than ${olderThanDays}d`);
  else if (d.readySubstate === "PROMOTED" || d.isRollbackCandidate === true)
    reasons.set(id, "promoted / rollback candidate");
  else if ((d.alias ?? []).some?.((a) => String(a).includes("btc500.net")))
    reasons.set(id, "aliased to production domain");
}

const deletable = sorted.filter((d) => !reasons.has(d.uid));
const x = deletable.length === 1 ? "deployment" : "deployments";

console.log(`Project: ${project}  Team: ${slug}`);
console.log(`Ready production deployments: ${sorted.length}`);
console.log(`Protected: ${sorted.length - deletable.length}`);
console.log(`Candidates for deletion: ${deletable.length} ${x}`);
for (const d of deletable) {
  const date = new Date(Number(d.created ?? d.createdAt ?? 0)).toISOString().slice(0, 10);
  console.log(`  ${date}  ${d.uid}  ${d.url ?? ""}`);
}

if (!apply) {
  console.log("\nDry run only — no deployments were deleted. Re-run with --apply to delete them.");
  process.exit(0);
}

let deleted = 0;
let failed = 0;
for (const d of deletable) {
  const url = new URL(`${API}/v13/deployments/${d.uid}`);
  url.searchParams.set("slug", slug);
  const response = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.ok) {
    deleted += 1;
    console.log(`deleted ${d.uid}`);
  } else {
    failed += 1;
    console.error(`FAILED ${d.uid}: ${response.status} ${(await response.text()).slice(0, 200)}`);
  }
}

console.log(`Done. Deleted ${deleted}, failed ${failed}.`);
process.exit(failed ? 1 : 0);
