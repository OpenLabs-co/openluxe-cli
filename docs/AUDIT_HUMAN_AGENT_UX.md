# CLI Audit — Maximally Useful for Humans **and** Their AI Agents

*Audited 2026-07-10 against `@openluxeco/cli` v0.7.1 (318 typed commands over the v1 API) and the OpenLuxe main repo (routes/api-v1.php, v1 Resources, web routes).*

## The core finding

The CLI treats every command as a **data pipe**: `callApi()` → `out(JSON)`. That is exactly right for AI agents and scripts — and wrong for a whole class of surfaces where the object is not the product. A `mini_game_play` row is not a game; a `smartboard` JSON blob is not a board you can draw on; a `livestream` record is not a stream you can watch. For those, the maximally useful output is a **canonical web link** (plus the data), and for pure "experience" surfaces the CLI should be link-first, the way `openluxe credits buy` already is.

The CLI already has the right idioms in three places — they just aren't generalized:

| Existing idiom | Where |
|---|---|
| Link-first command (no API call, prints/opens a URL) | `credits buy` |
| Error → hand the human a browser URL | 402 credits (`topup_url`), 402 Pro (`upgrade_url`), 403 terms (`accept_url`) |
| TTY-aware output (humans get art, agents get clean text) | help splash (`process.stdout.isTTY`) |

## Classification of the 60+ resources

Three UX classes. Class is per-resource with per-command exceptions.

### Class A — Data resources (raw JSON is correct; add nothing but polish)
contacts, notes, reminders, tasks, deals, contact-lists, showings, open-houses,
credits (balance/ledger/pricing/usage), webhooks, skills, search, me, industries,
crm-cultural-library, crm-portfolio, client-deals, invoices*, reviews,
message-campaigns, phone-numbers, email-messages, email-deliverability,
email-suppression, sms-messages, calls, email-templates, nft, profile, affiliate,
print, fulfillment, policies, goals, epics, accounting, receivables, payables,
procurement, inventory, hr, fixed-assets, manufacturing, tech-tree, influence,
qms, data-objects, data-records, business-dna, business-plan, iot, property,
funnels, ad-simulations, sites, travel, vms-communities, cli†

*invoices: the record is the product for the operator, but a **client-facing
pay/view link** (if the web app has one) belongs in the payload.
†cli (auth start/poll) is internal plumbing — hide it from `openluxe help`.

### Class B — Dual surfaces (JSON is useful **and** a web link belongs alongside)
Things a human frequently wants to open after finding them via the CLI:

listings (public page), store-products (product page), webinars (watch/register),
courses (learn), kits (`/k/{uuid}` landing), meetups, associations (hub),
branding-projects / brands (Brand Hub canvas), kanbans (board), smartboards (board),
command-centers (dashboard), professional-profiles (`/pro/{handle}`), livestreams
(join/watch), escrow (transaction page), openflix (watch), live-shop.

### Class C — Experience surfaces (the object is NOT the product; be link-first)
- **mini-games** — v1 exposes only `GET /mini-games/plays` (past-play records).
  You cannot play a game in a terminal. The CLI needs `openluxe mini-games open
  [game]` → prints + optionally opens the games hub / specific game URL, and the
  `plays` output should end with "Play: <hub-url>".
- **arena** — same shape: `matches` history is data; playing happens in the browser.
- **openflix movies/series** — watch links, not metadata dumps.
- **livestreams** — a `get` on a room should lead with the join URL.
- **smartboards / kanbans / branding-projects** — collaborative canvases; `get`
  is only useful as a way to reach the board.

## Findings

### F1 — No web-link affordance anywhere in success output 🔴 (the headline)
No resource prints a canonical web URL, there is no `--open` flag, and
`openBrowser()` is private to `auth.js`. Humans dead-end at JSON; agents have no
URL to hand their human (their system prompts tell them to relay links — there
are none to relay).

### F2 — the `public_url` convention exists but covers only 3 of ~60 surfaces 🔴
v1 already has the right convention — `public_url`, an absolute URL — but only
three surfaces emit it today: `KitResource` (`/k/{uuid}`),
`ProfessionalProfileResource` (`/pro/{handle}`), and `FunnelsController`
(inline, `/f/{slug}`). Resource classes live in
`app/Http/Resources/V1/` in the main repo; follow the existing pattern
(`url('/path/'.$key)` or a model `publicUrl()` helper).

**Why the server must own item URLs:** web routes frequently bind by
`slug`/`uuid`/`share_slug` while v1 payloads key by model id — Openflix web is
`/openflix/movie/{uuid}`, webinars/livestreams/courses/events/associations bind
by slug, and the client-facing invoice page is a **token** URL (`/i/{token}`)
the CLI cannot construct at all. CLI-side templating of item URLs would be
guess-and-drift; the server knows its own bindings. The CLI should only
construct **hub-level** links (`/mini-games`, `/credits/buy`, `/brand-hub`)
and prefer payload `public_url` for items.

### F3 — Empty states are 40 lines of paginator JSON 🟠
`mini-games plays` with zero plays prints a full `{data:[], links, meta}`
envelope. A human on a TTY should see: `No mini-game plays yet — play at
https://openluxe.co/<games-hub> ↗`. Agents (non-TTY) keep exact JSON.

### F4 — Envelope inconsistency: smartboards returns a raw paginator 🟠
`GET /smartboards` returns a bare LengthAwarePaginator (`current_page`,
`first_page_url`, … at top level) while the rest of v1 uses the API Resource
envelope (`{data, links, meta}`). The agent skill *documents* the latter as the
contract — smartboards silently violates it. Fix server-side; audit all v1
list endpoints for the same drift.

### F5 — Generated command names ship raw collisions 🟡
`list-2`, `movies-2`, `series-2`, `collections-2`, `assets-2`, `residents-2`,
`missions-2`, `reviews-2`, `passes-2`, `gates-2`, `relays-2`, `products-2`,
`minimum-quantities-2` — every one is a `get`-by-id that the generator suffixed
instead of naming. Also ambiguous flattenings in `contacts` (`status`, `issue`,
`overview`, `earnings`). Rename with back-compat aliases (old names keep
working, hidden from help).

### F6 — Typed-command drift: 318 CLI commands vs 329 v1 routes 🟡
Regenerate `resources.js` from the manifest; add the regeneration step to the
release checklist so parity doesn't rot.

### F7 — No human list rendering (P2, deliberate scope) 🟢
Lists print raw JSON even on a TTY. Fine for agents; heavy for humans. A
compact TTY table (id · title/name · status · updated) + `N of M` footer +
`--json` escape hatch would help humans without touching agent output (piped
output stays byte-identical JSON).

### F8 — MCP + skill don't teach the hand-off 🟠
- `mcp.js` tool output is the same raw JSON — once `web_url`/link mapping
  exists, MCP results inherit it for free (payload passthrough), but the tool
  descriptions should say "give the human the web_url when their goal is to
  view/do the thing".
- `SKILL.md` teaches URL hand-off **only for error gates** (terms/Pro/credits).
  It needs the positive rule: *"If the human's goal is to experience the thing
  (play, watch, join, edit a board, take a course), fetch the data if useful,
  then hand them the web link — do not paste the object."*

### F9 — Strengths worth keeping (no action)
Error UX (401 hint, two 402s distinguished, RFC 7807 rendering), `describe`
(schema lookup), `manifest` (machine surface), TTY-gated splash, remembered
`--insecure` scoped to its base, `credits buy` as the link-first prototype.

## The web-URL map (CLI ⇄ web routes)

Verified against the main repo (`routes/web.php`, `app/Http/Resources/V1/`,
`app/Http/Controllers/Api/V1/`) on 2026-07-10.

| CLI resource | URL in v1 payload today | Where a human goes | Source for item link |
|---|---|---|---|
| **mini-games** | — | hub `/mini-games` (`mini-games.index`), game `/mini-games/{slug}` | CLI hub link; server `public_url` on plays (game slug) |
| **arena** | — | lobby `/arenas`, match `/arenas/match/{match}` | CLI hub link; server for match |
| **openflix** | — | `/openflix/movie/{uuid}`, `/openflix/series/{uuid}` (public, domain-gated) | server (uuid binding) |
| **livestreams** | — | `/livestreams/{room:slug}` | server (slug binding) |
| **webinars** | — | `/webinars/{slug}`, watch `/webinars/{slug}/watch`, public share `/w/{share_slug}` | server (slug + share_slug) |
| **kits** | ✅ `public_url` → `/k/{uuid}` | landing `/k/{uuid}` (public), viewer `/kits/{kit}` (auth) | already done |
| **courses** | — | `/courses/{slug}` (public), learn `/courses/{slug}/learn` | server (slug) |
| **smartboards** | — | `/smartboards/{uuid}` (binds uuid, not id) | ✅ server + CLI (uuid) |
| **kanbans** | — | `/kanbans/{uuid}` (binds uuid, not id) | ✅ server + CLI (uuid) |
| **listings** | — | `/listings/{listing}` (auth), public `/listing/{uuid}` | server (public uses uuid) |
| **store-products** | — | storefront `/shop/{storeSlug}/products/{productId}` | server (needs store slug) |
| **meetups** | — | `/events/{event:slug}` (v1 model is HostedEvent!) | server (slug + naming mismatch) |
| **associations** | — | hub `/associations/{slug}`, public join `/communities/{slug}/join` | server (slug binding) |
| **branding-projects** | — | `/brand-hub/projects/{project}` | server or CLI (id) |
| **brands** | — | ⚠️ no dedicated page — nearest is `/brand-hub` | CLI hub link only |
| **command-centers** | — | `/command-center/{commandCenter}` | server or CLI (slug is the v1 key) |
| **professional-profiles** | ✅ `public_url` → `/pro/{handle}` | `/pro/{handle}` (public) | already done |
| **invoices** | — | client pay/view `/i/{token}` (public token!), builder `/crm/invoices/{invoice}` | server ONLY (token) |
| **client-deals** | — | `/crm/deal-flow/{clientDeal}` | server or CLI (uuid) |
| **deals** | — | `/deals/{deal}` | server or CLI (id) |
| **escrow** | — | `/escrow/{transaction}` (auth, escrow.access) | server or CLI (id) |
| **credits** | — | `/credits`, buy `/credits/buy` | CLI hub link (already has `credits buy`) |
| **funnels** | ✅ `public_url` → `/f/{slug}` | public `/f/{slug}`, builder `/crm/funnels/{funnel}` | already done |
| **live-shop** | — | `/live-shop` (public), per-store `/shop/{storeSlug}/live` | CLI hub link |
| **contacts** | — | `/contacts/{contact}` (also `/clients/{contact}`) | server or CLI (id) |
| **tasks** | — | `/tasks` | CLI hub link |
| **goals** | — | `/goals` (index only — ⚠️ no per-goal page) | CLI hub link |
| **epics** | — | ⚠️ no web page exists | none — note in help |
| **render** | ✅ result `url` when complete + `status_url` | n/a (async asset) | already done |
| **generations** | `status_url` + asset URLs inside `result` | n/a (async) | already done |

⚠️ gaps worth their own tickets: no web page for epics or per-brand or
per-goal; `meetups`(v1) ↔ `HostedEvent`/`/events`(web) naming mismatch will
confuse agents and humans alike.

## Implementation plan

**P0 — the link layer (CLI, this repo)**
1. Extract `openBrowser()` from `auth.js` into a shared util.
2. Add optional `web` metadata per resource in `resources.js`:
   `{ hub: '/path', item: '/path/:param' | (row) => path }`.
3. After `out(res)` on a TTY, print `↗ Open: <url>` (only when
   `process.stdout.isTTY`, so piped/agent output is byte-identical).
   Prefer `public_url` from the payload when present (kits, pro profiles,
   funnels already emit it); fall back to the resource's `web` map for
   hub links and id-bound items only — never guess slug/token bindings.
4. Global flags: `--open` (launch browser at the item/hub URL), `--web`
   (print the URL only, skip the API call for hub-level links), `--json`
   (suppress the link line even on TTY).
5. Class C link-first commands: `mini-games open`, `arena open`,
   `openflix open <movie|series>`, `livestreams join <room>`,
   `smartboards open <id>`, `kanbans open <id>` — modeled on `credits buy`.
6. Empty-state line for TTY lists (F3).
7. Hide the `cli` resource from help (F5-adjacent).
8. SKILL.md positive hand-off rule + MCP tool description updates (F8).

**P1 — server-side canonical URLs (main repo)**
9. Extend `public_url` to every Class B/C v1 Resource (F2) — follow the
   existing `KitResource`/`ProfessionalProfileResource` pattern in
   `app/Http/Resources/V1/`; the slug/uuid/token-bound surfaces (openflix,
   livestreams, webinars, courses, meetups, associations, invoices `/i/{token}`,
   listings public uuid, store products) can ONLY be done here; document the
   field in PUBLIC_API_V1.md.
10. Fix smartboards envelope + audit remaining list endpoints (F4).
11. Consider `GET /mini-games` catalog endpoint (games list with `web_url` +
    `play_url`) so agents can answer "what games are there?" (today only
    plays-history exists on v1).

**P2 — polish**
12. Regenerate resources.js to close the 318→329 drift (F6) + rename `-2`
    commands with aliases (F5).
13. TTY table rendering for lists (F7).

## Implementation status (2026-07-10)

**P0 shipped in CLI v0.8.0** (this repo): browser.js, `WEB` map + injected
`open` commands on 20+ resources, `--open`/`--web`/`--json`, TTY-only stderr
`↗` hints, empty-state links, hidden `cli` resource, SKILL.md hand-off rule,
MCP description updates. Piped output verified byte-identical to 0.7.1.

**P1 shipped in main repo** (develop): `public_url` on 17 surfaces
(15 Resources + SmartboardResource new + ClientDealsController inline),
smartboards envelope fixed to `{data, links, meta}`, `public_url` documented
in PUBLIC_API_V1.md, 60 targeted v1 tests green. **Binding corrections found
during implementation** (the audit table above has been amended): smartboards,
kanbans, deals, and client-deals bind **uuid**; contacts accept numeric id;
brand hub lives at `/open-creative/brand-hub/...`; invoices got the tokenized
`/i/{token}` (or `/e/{token}` for estimates) — not skipped after all.
Still skipped: mini-game plays' per-game URL (needs a `game` eager-load),
store products (needs store slug relation).

**P1/P2 follow-ups closed (2026-07-10, CLI v0.8.1 + main repo develop)**:
- `mini-games plays` and `store products` now carry `public_url` (the
  eager-load concern was real but cheap — one extra query per page/record,
  `->with('miniGame:id,slug')` / `->with('store:id,slug')`, not N+1).
- New `GET /api/v1/mini-games` catalog endpoint (`MiniGameResource`, reuses
  the `games:mini-games:read` scope) + CLI `mini-games list`.
- `docs/api/response-examples.json` hand-corrected for smartboards (envelope
  + `public_url`) and the two mini-games endpoints — surgical text edits, not
  a full `CaptureResponseExamplesCommand` run (that command has no per-endpoint
  scope option; regenerating all ~350 would touch far more than this fix
  needed and risk an oversized, hard-to-review diff against a live account).
- Full API↔CLI parity closed and machine-verified: the main repo's
  `scripts/export-cli-surface.mjs` (which the CLI's own `resources.js`
  docstring pointed at) + `php artisan api:surface-audit` were used instead of
  hand-diffing routes — **323/323 (100%) on both CLI and MCP axes**. This
  caught real gaps my own audit table missed: a whole `reachverce` campaigns
  resource, a `business-succession` resource, `sites visitor`, and 7 missing
  `get` commands on resources that only had `list` (ad-simulations,
  business-dna, epics, funnels, goals, kits, policies).
- Investigated and deliberately excluded: `/api/v1/workflows/*` (17 routes)
  and `/mcp` looked like public API surface from the raw route table but
  aren't — `workflows` is the SPA's own session-authed (`web`+`auth:sanctum`)
  workflow-builder feature nested in `routes/api.php` under a prefix that
  happens to start with `v1/`, not the PAT-authenticated `routes/api-v1.php`;
  a CLI bearer token literally cannot call it. `/mcp` is the hosted MCP
  JSON-RPC transport, not a REST resource. The PHP coverage service already
  excludes both from its public-capabilities registry, confirming the read.
- The 13 auto-generated `-2` command name collisions (F5) renamed to clear
  singular names (`nft assets-2`→`asset`, `openflix movies-2`→`movie`, …),
  old names kept as hidden aliases (still dispatchable, absent from help/
  manifest/MCP discovery) so nothing already scripted against them breaks.

**Still open**: TTY human-readable list tables (P2, deliberate scope — piped/
agent JSON output must stay untouched, this is additive polish only); the
pre-existing `store.products` **docs** gap in `PUBLIC_API_V1.md` predates this
audit and wasn't introduced by it, left as tracked debt rather than expanding
scope. Both discovered incidentally by running the *existing* coverage tool
rather than my own manual diffing — worth remembering: check for a project's
own audit tooling before hand-rolling one.

**Also noticed, unrelated, not fixed**: `openluxe describe sites visitor` 404s
— the live `/developers/reference/schema` generator (`DevelopersController::
referenceSchema`, main repo) doesn't index `GET /sites/{token}/visitor` even
though the route itself works fine and is now a typed CLI command. This is a
gap in the reference-schema route-discovery logic, not something this audit
touched or introduced — flagged for whoever owns that generator next.

## Verification checklist (when implementing)
- [ ] `openluxe mini-games plays` piped → byte-identical JSON to today.
- [ ] Same command on a TTY → JSON + `↗ Play:` line; `--json` suppresses it.
- [ ] `openluxe mini-games open` prints the hub URL; `--open` launches browser.
- [ ] MCP `tools/call` results unchanged in shape; descriptions mention web_url.
- [ ] SKILL.md hand-off rule present; `openluxe skill show` reflects it.
- [ ] Every Class B/C `get` prints a link on TTY (spot-check 5 resources).
