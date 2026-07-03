---
name: openluxe
description: Drive the OpenLuxe platform — CRM contacts/tasks/deals, real-estate listings, e-commerce stores and fulfillment, business ERP/ledger reports, kits, webinars, communities, AI generation, and credits — from a terminal or MCP client. Use when asked to read or write any OpenLuxe data, automate OpenLuxe workflows, or integrate an agent with OpenLuxe.
---

# OpenLuxe for AI agents

OpenLuxe is an all-in-one business platform (CRM, real-estate listings, e-commerce + warehouse fulfillment, business ERP with a real general ledger, contracts/escrow, communities, webinars, kits, AI generation). The public **v1 API** exposes ~317 capabilities; the CLI mirrors 100% of them, so anything the API can do, you can do from a shell.

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
openluxe manifest                 # ALL ~318 typed commands as JSON — start here
openluxe describe <resource> <command>   # input/output schema for one command
openluxe describe POST /notes            # same, for any raw endpoint
```

The full human reference with schemas and examples is at `https://openluxe.co/developers/reference`.

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
