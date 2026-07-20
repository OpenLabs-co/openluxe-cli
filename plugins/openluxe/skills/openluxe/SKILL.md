---
name: openluxe
description: Drive the OpenLuxe platform — CRM contacts/tasks/deals, real-estate listings, e-commerce stores and fulfillment, business ERP/ledger reports, kits, webinars, communities, AI generation, and credits — from a terminal or MCP client. Use when asked to read or write any OpenLuxe data, automate OpenLuxe workflows, or integrate an agent with OpenLuxe.
---

# OpenLuxe for AI agents

OpenLuxe is an all-in-one business platform (CRM, real-estate listings, e-commerce + warehouse fulfillment, business ERP with a real general ledger, contracts/escrow, communities, webinars, kits, AI generation). The public **v1 API** exposes ~323 capabilities; the CLI mirrors 100% of them, so anything the API can do, you can do from a shell.

## Pick a surface

| Surface | When | How |
|---|---|---|
| **CLI** (`openluxe`) | You can run shell commands | `npm i -g @openluxeco/cli` |
| **MCP (local)** | You are an MCP client (Claude Code, Cursor…) | server command: `openluxe mcp` |
| **MCP (hosted)** | No local install allowed | `https://openluxe.co/api/v1/mcp` with `Authorization: Bearer ol_itk_…` |
| **REST** | Direct HTTP | `https://openluxe.co/api/v1`, Bearer PAT, `Accept: application/json` |

Everything below applies to all four — the CLI and MCP are thin, faithful proxies over the same scoped REST surface.

## Auth (one-time, human-in-the-loop)

```
openluxe auth login     # prints a code, opens a browser; a human approves once
openluxe auth status    # who am I / which server
```

Login stores a bearer token at `~/.openluxe/credentials.json`. You never handle a pasted secret. Tokens are revocable at Settings → Integrations. For raw REST, a human creates a PAT (`ol_itk_…`) at `/developers/tokens`.

Two account-level gates can block every call until a HUMAN acts in a browser — detect them and hand the URL back to your user instead of retrying:
- `403` problem+json with `type` ending `/api_terms_required` → human must accept the API Terms at the included `accept_url`.
- `402` problem+json with `type` ending `/platform_access_required` → human must unlock Pro access at the included `upgrade_url`.

## Discover what exists

```
openluxe                          # all command groups
openluxe <resource>               # commands for one resource (method, path, scope)
openluxe manifest                 # ALL ~333 typed commands as JSON — start here
openluxe describe <resource> <command>   # input/output schema for one command
openluxe describe POST /notes            # same, for any raw endpoint
```

The full human reference with schemas and examples is at `https://openluxe.co/developers/reference`.

## Start from a goal

OpenLuxe's entry point for *work* is the **goal**, not the object. Before you do
anything substantive, ask what it's in service of:

```
openluxe deliverables list --outstanding 1     # what every goal still needs made
```

The shape you get back:

- **Goal** — a single objective, with a scope (business / personal / learning /
  legal), a target date, and a progress %.
- **Deliverable** — a placeholder for something that *does not exist yet*: "a
  sales deck must be made for this goal." Each carries an `expected_type` (a real
  object type — `sales_presentation`, `listing`, `video`, `design`, `email_campaign`,
  `note`…) and a status: `planned → in_progress → made` (or `skipped`).

A deliverable is the platform telling you, in advance, what work is outstanding.
If the user's ask matches one, you have just been handed the spec.

### Attach what you make back to the goal

This is the half agents forget. Creating the object is not finishing the job —
an artifact that isn't attached is invisible to the user's plan, and the goal's
progress never moves.

```bash
# 1. See what's owed on a goal
GOAL=$(openluxe goals list | jq -r '.data[0].id')
DELIV=$(openluxe deliverables list --goal $GOAL --outstanding 1 | jq -r '.data[0].id')

# 2. Make the thing — any endpoint, typed or raw. AI generation costs credits.
GEN=$(openluxe api POST /generate/sales_presentation -d '{"prompt":"…"}' | jq -r '.data.id')
openluxe api GET /generations/$GEN          # poll until status=completed

# 3. Attach it to the deliverable it satisfies
openluxe deliverables fulfil $DELIV -d '{"resource_type":"sales_presentation","resource_id":918}'
# → deliverable becomes "made", goal progress recomputes
```

Every outstanding deliverable also carries a `fulfil_with` string spelling out its
own follow-up call, so you don't have to remember the shape. If what you made
doesn't match a planned deliverable, plan one first
(`openluxe deliverables plan $GOAL -d '{"title":"…","expected_type":"listing"}'`)
and then fulfil it.

**Don't over-apply this.** If the user asks a question, looks something up, or
does a one-off with no goal behind it, just do it — goals are the entry point for
*work that ships something*, not a toll booth on every call.

## Call things

```
openluxe contacts list --per_page 5          # flags become query params
openluxe contacts get 123
openluxe contacts create -d '{"first_name":"Ada","email":"ada@example.com"}'
openluxe api GET /credits/balance            # raw passthrough — covers EVERY endpoint
openluxe api POST /notes -d '{"contact_id":123,"content":"Called re: valuation"}'
```

- Output is **pure JSON on stdout** (no color when piped). Exit code `0` = success, `1` = any failure.
- Empty bodies (deletes, 204s) print `{"ok":true,"status":204}`.
- List responses are Laravel paginator shape: `{data:[…], links, meta}` — page via `--page`/`--per_page`.

## Hand the human a link when the goal is the experience

Some records are **not the product** — you can't play a mini game, watch a movie,
join a livestream, or draw on a smartboard in a terminal. When the user's goal is
to *do/see the thing* (play, watch, join, edit, take a course, review a page):

1. Records that carry a **`public_url`** field: give the user that URL — it is the
   record's canonical web page. Don't paste the JSON object at them.
2. Typed commands support `--web` (print just the record's web URL) and every
   browsable resource has an `open` shortcut: `openluxe mini-games open`,
   `openluxe smartboards open 42`, `openluxe contacts open 123`,
   `openluxe webinars open <slug>`, `openluxe kanbans open 7`, … (`↗` entries in
   `openluxe <resource>` help). On a TTY these launch the browser; piped, they
   print the URL — so YOU can run them to fetch the link to relay.
3. The data endpoints still matter for *answering questions* (history, stats,
   fields) — fetch data to reason, hand a link to act.

## Error contract (how to self-correct)

| Status | Shape | What you do |
|---|---|---|
| 422 | `{message, errors:{field:[…]}}` | Fix the named fields and retry — errors name exactly what's wrong |
| 404 | problem+json or model message | Wrong id or not yours (ownership reads as 404) |
| 403 `api_terms_required` | problem+json + `accept_url` | Give the URL to your human; do not retry |
| 402 `platform_access_required` | problem+json + `upgrade_url` | Give the URL to your human; do not retry |
| 402 `error: "insufficient_credits"` | NOT problem+json; has `suggested_topup_*`, CLI prints `topup_url` | Paid action, balance short — human tops up, then retry once |
| 429 | throttle | Back off; default limit 600/min |

The two different 402s matter: tell them apart by `type` (URL) vs `error` (string).

## What the domains are for (orientation)

- **Goals & deliverables** (`goals`, `epics`, `deliverables`): the objective spine — *why* work is happening and *what still has to be made* for it. Epics group goals; goals carry milestones and **deliverables** (placeholders for objects that must be made). `openluxe deliverables list --outstanding 1` is the fastest way to see what the user actually needs done. Scopes: `goals:read` / `goals:write`.
- **CRM** (`contacts`, `notes`, `reminders`, `tasks`, `deals`, `contact-lists`): the relationship system of record. Contacts are owner-scoped; most CRM writes need `crm:*:write` scopes.
- **Listings / real estate** (`listings`, `showings`, `open-houses`, `bookings`): property inventory + scheduling.
- **Commerce** (`store-products`, `orders`, `fulfillment`): storefronts, orders, warehouse queue (fulfillment is read-only on v1).
- **Business / ERP** (`business`, `ledger`, `receivables`, `payables`, `procurement`, `qms`, `fixed-assets`…): real double-entry accounting — ledger reports are read endpoints; treat money data as sensitive.
- **Credits** (`credits`): the platform currency funding AI generation and paid actions. Check `credits balance` before expensive operations.
- **AI generation** (`generate`, `generations`): async jobs — POST returns an id, poll `generations get <id>`. Costs credits.
- **Content & community** (`kits`, `webinars`, `communities`, `professional-profile`, `sites`): guided resource sequences, broadcasts, groups, public profiles, generated websites.

## Recipes

```bash
# CRM: log a touch on a contact found by email
CID=$(openluxe contacts list --search ada@example.com | jq -r '.data[0].id')
openluxe api POST /notes -d "{\"contact_id\":$CID,\"content\":\"Sent Q3 valuation deck\"}"

# What can I afford? (credits by type)
openluxe credits balance | jq '[.data[]|{type:.credit_type,left:.credits_remaining}]'

# Async AI generation — feature goes in the URL; costs credits, 402s if short.
# Features: image, video, blog_article, podcast, sticker, sound_effect, dossier,
# email_template, sales_presentation, brand_colors, agent_{alfred,apollo,atticus,eva,odysseus}
GEN=$(openluxe api POST /generate/image -d '{"prompt":"gold art-deco poster"}' | jq -r '.data.id')
openluxe api GET /generations/$GEN     # poll until status=completed

# Search the whole platform
openluxe api GET /search --q "founders"
```

## BYOA — be the generation engine (zero platform credits)

The generator apps can delegate generation to YOU instead of the platform AI —
email templates, sales presentations, websites, print designs, ads, blog
articles, brand-color palettes, dossiers, videos, sound effects, and podcasts.
The human picks **"My agent"** as the engine in the app (or you direct-create);
a *delegation* carrying the full work order is queued for your token. You
generate the content with your own model and submit it back — the app's UI
completes live, and no platform AI credits are charged.

```bash
# Wait for the next request, claim it (15-min lease), print the work order:
JOB=$(openluxe agent listen)                       # blocks until one arrives
UUID=$(echo "$JOB" | jq -r '.id')
echo "$JOB" | jq '.spec'                           # prompt, context, guidelines

# Generate content that satisfies .spec.result_contract, then submit.
# The response carries a preview_url — the finished asset's web page (or CDN
# media url). ALWAYS relay it to the human as a clickable link:
openluxe delegations submit $UUID -d '{"subject_line":"…","html":"<html>…</html>"}' | jq -r '.data.preview_url'

# Need an image in the result? NEVER an external URL — upload it first:
URL=$(openluxe delegations upload $UUID ./hero.png | jq -r '.url')

# Can't do it? Fail fast so the human's UI resolves immediately:
openluxe delegations fail $UUID --reason "No image model available"

# Start a generation yourself (direct-create, auto-claims for you):
openluxe delegations create -d '{"feature":"email_template","prompt":"Spring newsletter"}'

# MAKE CHANGES to an existing asset (mode:edit) — pass the id from a prior
# result as "target"; the work order's spec.current holds the current content:
openluxe delegations create -d '{"feature":"email_template","mode":"edit","target":123,"instructions":"Make the CTA more urgent and add a P.S."}'
```

BYOA rules:
- **Hand the human the preview link.** Every completed submit returns `data.preview_url` (and `delegations get <uuid>` exposes it on completed rows). When you finish, tell the user what you made and give them the clickable `preview_url` so they can open it — that's the payoff of the whole loop. On a TTY the CLI also prints `↗ Preview: <url>` on stderr automatically.
- **Revising, not just creating:** `mode:"edit"` targets an existing artifact (`target` = the id/uuid a prior create/preview result returned) and puts its current content in `spec.current` + the ask in `spec.instructions`. Return the COMPLETE revised content (not a diff) through the same `result_contract`. Supported for `email_template`, `blog_article`, `dossier`; for `website_page`, pass `section_id` to a normal `create` to regenerate one section. Features without an edit seam (media, brand_colors, ads, print, presentations) just regenerate.
- **Follow `.spec.result_contract` exactly** — it names the payload fields, byte caps, and count limits for that feature (`email_template`: subject_line+html; `sales_presentation`: slides[]; `website_page`: sections[]; `print_design`: pages[]; `blog_article`: content_html; `brand_colors`: colors JSON; `dossier`: summary+body markdown; and media features — `ad_creative`/`video`/`sound_effect`/`podcast` — reference the url(s) you got from `delegations upload`).
- **All HTML is sanitized server-side** — scripts/iframes/handlers are stripped; don't bother emitting them. Media must be `assets.openluxe.co` (uploaded via `delegations upload`) or the submit is rejected 422 (fix and resubmit — your claim survives).
- **Work fast** — unclaimed requests expire in 30 min, your claim lease in 15 (re-claim refreshes it). A human is watching a waiting card.
- Identical re-submits are safe (idempotent); a `409 delegation_claimed` on claim means another of the user's agent tokens got it first.

## Local / self-hosted development

```
OPENLUXE_API_URL=https://openluxe.test OPENLUXE_INSECURE=1 openluxe auth login
```

`OPENLUXE_API_URL` points at any deployment; `OPENLUXE_INSECURE=1` (or `--insecure`) accepts a self-signed cert and, when used at login, is **remembered for that server** so later commands need no flags. Pointing at a different server always restores full TLS verification.

## Rules

1. **Never guess ids** — list/search first, then act on the id you found.
2. **Destructive ops are real** — `delete` commands hard-delete platform data. Confirm intent with your user before deleting anything you didn't just create.
3. **Paid actions cost real credits** — check `credits balance` first; on the credit-shortfall 402, surface the top-up URL, never loop-retry.
4. **Respect the gates** — Terms/Pro 402/403 blocks need a human browser action; retrying is useless.
5. **Money and PII read endpoints may be field-masked** — a `_masked` array on a resource names fields redacted for your token's role; don't treat masked nulls as missing data.
6. Prefer typed commands (self-documenting) over raw `api` when one exists; `openluxe manifest` tells you.
7. **Experience surfaces end in a link, not JSON** — when the user wants to play/watch/join/edit, relay the record's `public_url` (or `openluxe <resource> open …` URL); dump objects only when they asked for data.
8. **Work lands on a goal** — before substantive work, check `openluxe deliverables list --outstanding 1`; after you make something in service of a goal, `openluxe deliverables fulfil …` so the deliverable closes and progress moves. An artifact you made and never attached is invisible to the user's plan. Skip this only for questions, lookups, and one-offs with no goal behind them.
