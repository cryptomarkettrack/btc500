# Routes

TanStack Start uses **file-based routing**. Every `.tsx` file in this directory
defines a route. Do **not** create `src/pages/`, `src/routes/_app/index.tsx`, or
`app/layout.tsx` — those are Next.js / Remix conventions. The only root layout
is `src/routes/__root.tsx`.

## Conventions

| File | URL |
| --- | --- |
| `index.tsx` | `/` |
| `about.tsx` | `/about` |
| `users/index.tsx` | `/users` |
| `users/$id.tsx` | `/users/:id` (dynamic — bare `$`, no curly braces) |
| `posts/{-$category}.tsx` | `/posts/:category?` (optional segment) |
| `files/$.tsx` | `/files/*` (splat — read via `_splat` param, never `*`) |
| `_layout.tsx` | layout route (renders children via `<Outlet />`) |
| `__root.tsx` | app shell — wraps every page; preserve `<Outlet />` |

`routeTree.gen.ts` is auto-generated. Don't edit it by hand.


## Architecture (feature modules)

Routes stay thin: **head / loader / compose**. UI and domain logic live under:

| Concern | Location |
| --- | --- |
| Shared SEO / site URL | `src/lib/site.ts` |
| Shared formatters | `src/lib/format.ts` |
| Shared query options | `src/lib/queries.ts` |
| Halving schedule | `src/lib/halvings.ts` |
| Feature UI | `src/components/<feature>/` |
| Feature analysis | `src/lib/*-analysis.ts`, `src/lib/dca-compare.ts`, etc. |
| Shared route pending/error | `src/components/route/` |

Do not grow route files back into god-components — extract sections instead.
