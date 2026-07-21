# Changelog

All notable changes to `@openluxeco/cli` are documented here. This project
adheres to [Semantic Versioning](https://semver.org/).

## [0.14.0]

### Added
- **Goals as the entry point for work.** OpenLuxe organizes *work* around a
  goal, not an object — the CLI now mirrors that whole spine:
  - **`projects`** — the top container. `list`, `get` (`?include=children`),
    `create`, `update`, `delete` (soft; goals survive), and `move` to file a
    goal/epic under a project.
  - **`goals`** — full CRUD plus milestones: `milestones`, `add-milestone`,
    `update-milestone` (status `pending|completed`), `delete-milestone`.
  - **`deliverables`** — the objects a goal still owes. `types`,
    `list` (`--outstanding 1`, `--goal`, `--status`, `--expected_type`),
    `get`, `plan` (declare something that must be made for a goal),
    `update`, `fulfil` (attach what you made back to the goal so its progress
    moves), and `delete`.

  The SKILL.md gains a **"Start from a goal"** section and a rule that finished
  work must land on a goal, so an agent asks *what an ask is in service of*
  before it starts, and attaches the artifact when it's done.
- **Storyline scheduling + frame reference.** The `storylines` resource gains
  `frame-types` (the frame schema reference — every frame type with
  fields/enums/limits, read before authoring frames), `schedules` /
  `schedule-responses` (reads), and `create-schedule` / `update-schedule` /
  `replace-schedule` / `delete-schedule` for recurring survey sends
  (`storylines:schedules:write`).

## [0.13.0]

### Added
- **Per-area expert skills.** `openluxe skill list` shows a role-cast operator
  guide for every capability area (CRM, Business/ERP, marketing, media, …);
  `openluxe skill show <area>` prints one; `openluxe skill install <area>`
  writes it into your harness (`~/.claude/skills/openluxe-<area>/SKILL.md`,
  `--project` for repo-local, `--codex` for a managed block in AGENTS.md) so
  your agent role-casts as that area's specialist. Guides are fetched from the
  v1 API (`GET /skills/areas[/{area}]`) — the same content the MCP
  `openluxe_skill` tool serves. `skill show`/`skill install` with no area still
  install the overall developer skill.

### Changed
- **Typographic splash mark.** The gem above the wordmark is now formed out of
  the repeating word `openluxe` — the pointed-top pentagon brand mark picked out
  of the letter field with its wall band lit in champagne gold and the hollow
  center dimmed, so the brand name literally draws the brand mark. Drawn with
  shallow diagonals so it reads ~1:1 square (≈28 cols) despite 2:1 terminal
  cells, instead of the old tall, narrow line sliver.
- **Resource help is grouped and described.** `openluxe help` now lists the ~90
  resources under capability-area headers (Account & Search, AI & Automation,
  CRM & Clients, Business & ERP, …) — in a fixed, sensible order and
  alphabetical within each group — instead of one long flat insertion-ordered
  list. Mirrors the MCP capability map so the CLI, MCP, and docs tell one story.
- **Every resource has a real one-line description.** The auto-generated
  placeholder summaries (e.g. `nft (v1)`, `goals (v1)`) are replaced with human
  descriptions of what each resource is, with `(read-only)` noted where the v1
  API is read-only. Descriptions live in a single `RESOURCE_META` map in
  `resources.js` and flow to `help`, `<resource>` help, and `manifest`.

## [0.11.0]

### Added
- **Command aliases.** `ol`, `luxe`, `openl`, `verce`, `ov`, and `openverce`
  all invoke the CLI (e.g. `ol mcp`, `luxe crm contacts list`); `--help` reflects
  the name you typed.

## [0.10.1]

### Added
- **Claude Desktop extension (`.mcpb`).** `node scripts/build-mcpb.mjs` packs
  the stdio MCP server into a one-click-install desktop extension
  (`dist/openluxe-<version>.mcpb`, published as a GitHub release asset).
  Claude Desktop prompts for an OpenLuxe API token (stored in the OS
  keychain) — no JSON config, no `auth login`.
- **`OPENLUXE_TOKEN` environment variable.** Overrides the stored credential
  everywhere (CLI, `openluxe mcp`, the desktop extension) so credential-less
  environments — extensions, CI, containers — can authenticate directly.

## [0.10.0]

### Added
- **BYOA preview links.** A completed `delegations submit` now returns
  `data.preview_url` — the finished asset's page in the app (email/blog/
  presentation/website/ad editor, dossier viewer) or, for media
  (video/sound/podcast), the direct CDN url. On a TTY the CLI prints
  `↗ Preview: <url>` on stderr (piped stdout stays pure JSON), so from an
  agent's chat you get a clickable link the moment the asset is ready.
  `delegations get <uuid>` exposes `preview_url`/`public_url` on completed
  rows too.
- **BYOA edit mode — make changes, not just new things.** `delegations create`
  accepts `"mode":"edit"` with a `target` (the id/uuid a prior result
  returned) and `instructions`. The work order's `spec.current` carries the
  asset's current content; you submit the complete revised version through the
  same `result_contract`. Supported for `email_template`, `blog_article`, and
  `dossier` (websites already revise one section at a time via a normal
  `create` with `section_id`). Reuses the same server-side sanitized write
  path — no new mutation surface.
- SKILL.md: teaches relaying `preview_url` to the human and the `mode:edit`
  revise loop.

## [0.9.1]

### Changed
- README now leads with **Bring Your Own Agent**: a dedicated section
  explaining that your agent can be the generation engine for the creator
  apps (email/presentations/websites/print/ads/blog/brand-colors/dossier/
  video/sound-effects/podcasts) at zero platform AI credits, the `agent
  listen` → generate → `delegations submit` loop, the upload path for media,
  and the server-side sanitization guarantee — plus intro + "For AI agents"
  cross-links and BYOA keywords for npm discoverability. Docs only; no code
  change from 0.9.0.

## [0.9.0]

### Added
- **BYOA — be the generation engine.** The OpenLuxe generator apps (email
  creator, sales presentations, website builder, print designer, ad maker)
  can now delegate generation to YOUR agent instead of the platform AI, for
  zero platform credits:
  - `openluxe agent listen [--feature <key>] [--timeout <secs>] [--no-claim]`
    — long-polls for the next delegated generation request, claims it
    (token-keyed 15-min lease), prints the full work order JSON, exits.
  - `openluxe delegations …` typed commands: `list` / `get` / `create`
    (direct-create + auto-claim) / `claim` / `submit` / `fail`
    (scopes `agent:delegations:read|write`).
  - `openluxe delegations upload <uuid> <file>` — multipart image upload for
    a claimed delegation; results may only reference these returned URLs
    (external image URLs are rejected server-side).
- SKILL.md: a "BYOA — be the generation engine" recipe teaching host agents
  the listen → generate per `spec.result_contract` → submit loop, the
  sanitization contract, and the lease/expiry rules.

## [0.8.2]

### Changed
- README rewritten to lead with why the CLI/MCP surface exists and what it's
  worth: a "Why this exists" intro, a "Measured, not claimed" section citing
  the real openluxe-bench results (9.2x fewer tokens than one tool per
  endpoint, 2.2x fewer than a cold integration, 1.5x fewer than HubSpot's own
  API on the same task, 100% vs. 70% task pass rate) with a link to the
  versioned public results at https://openluxe.co/developers/benchmarks, and
  a "What's inside" table of the 119-app / 352-endpoint registry by category.
  No code changes.
- `package.json` `description` and `keywords` sharpened for npm search
  discoverability (added `mcp`, `model-context-protocol`, `agent-tools`,
  `claude-code`, `ai-agents`).

## [0.8.1]

### Added
- 14 new typed commands closing the CLI ⇄ v1 API parity gap found while
  finishing the human/agent UX audit: `ad-simulations get`, `business-dna
  get`, a new `business-succession` resource (`list`/`get`), `epics get`,
  `funnels get`, `goals get`, `kits get`, `policies get`, a new `reachverce`
  resource (`list`/`get`/`recipients`/`events`), `sites visitor`, and
  `mini-games list` (catalog of playable games — new on the API side too).
  `/api/v1/workflows/*` and `/mcp` were investigated and correctly excluded:
  the former is the SPA's internal session-authed workflow builder sharing a
  URL prefix by coincidence, not part of the PAT-authenticated public API;
  the latter is the hosted MCP JSON-RPC transport, not a REST resource.
- Back-compat aliases for the 13 auto-generated `-2`-suffixed command names
  (e.g. `nft assets-2` → `nft asset`, `openflix series-2` → `openflix
  series-show`) — the old names still dispatch, just hidden from
  `openluxe <resource>` help so there's one obvious name per command.

### Changed
- `smartboards get`/`smartboards open` now use `:uuid` (matching the actual
  route binding) instead of the placeholder `:smartboard` param name.
- `manifest` and MCP `openluxe_list_endpoints` exclude hidden legacy aliases
  (still fully dispatchable, just not listed twice on the discovery surface).
- CLI ⇄ v1 API parity is machine-verified via the main repo's
  `php artisan api:surface-audit` — 323/323 (100%) on both the CLI and MCP
  axes as of this release.

## [0.8.0]

### Added
- **Browser hand-off layer** (from the human/agent UX audit,
  `docs/AUDIT_HUMAN_AGENT_UX.md`): some records aren't the product — you play
  a mini game or draw on a smartboard in the app, not in a terminal.
  - `openluxe <resource> open [arg]` browser shortcuts on 20+ resources
    (`mini-games open [slug]`, `smartboards open 42`, `webinars open <slug>`,
    `contacts open 123`, `arena open`, `openflix open`, …). On a TTY they
    launch your browser (`--no-open` to skip); piped, they print the URL.
  - `--web` on typed commands prints just the record's canonical web URL;
    `--open` launches it after the JSON; `--json` suppresses the hint.
  - On a TTY, typed commands print a dim `↗ Open: <url>` hint on **stderr** —
    piped stdout is byte-identical to before (agents/scripts unaffected).
  - Empty lists now point somewhere useful: `↗ Nothing here yet — play at
    https://openluxe.co/mini-games`.
  - Link precedence: payload `public_url` (server-known slug/uuid/token
    bindings) → id-bound item map → resource hub. The CLI never guesses
    slug/token URLs.
- Agent skill (SKILL.md): new "hand the human a link when the goal is the
  experience" section + rule 7; MCP server instructions/tool descriptions now
  teach relaying `public_url`.

### Changed
- The internal `cli` resource (device-auth plumbing) is hidden from
  `openluxe help` (still functional).
- `openluxe manifest` and MCP `openluxe_list_endpoints` exclude the new
  browser shortcuts (they are CLI-local, not API endpoints).

## [0.7.1]

### Fixed
- `auth login` no longer inherits the API base saved by a previous login — a
  past dev-server login (`openluxe.test`) silently captured every future
  login, including production ones. Login now resolves `--base` →
  `OPENLUXE_API_URL` → `https://openluxe.co` and prints which server it is
  signing in to. Commands other than login still use the saved base their
  token belongs to.

## [0.7.0]

### Added
- **The OpenLuxe agent skill** — `plugins/openluxe/skills/openluxe/SKILL.md`
  teaches any AI agent the entire platform: surfaces, auth, discovery, the
  error contract, domain purposes, recipes, and safety rules. Ships in the
  package; also downloadable at `https://openluxe.co/developers/skill.md`.
- **`openluxe skill show | install [--project|--codex]`** — install the skill
  into Claude Code (personal or repo-local) or OpenAI Codex (an idempotent
  managed block in `~/.codex/AGENTS.md` that never touches other content).
- **Claude Code plugin + marketplace** — `/plugin marketplace add
  OpenLabs-co/openluxe-cli` then `/plugin install openluxe@openluxe` gets the
  skill and the MCP server (wired to `openluxe mcp`) in one step.
- **`openluxe describe <resource> <command>`** (or `describe POST /notes`) —
  per-endpoint params/response schema + captured example, resolved from the
  platform's OpenAPI doc via `/developers/reference/schema`. Where a write
  body isn't statically typed, prints an honest note to lean on the 422
  field errors.

### Changed
- Empty success bodies (deletes, 204s) now print `{"ok":true,"status":204}`
  instead of `null`.
- The splash screen is skipped when stdout isn't a TTY — piped help goes
  straight to the commands.

## [0.6.1]

### Fixed
- The splash screen is now **responsive to terminal width**: full mark +
  ANSI-shadow wordmark at ≥ 72 columns, a smaller mark + compact box-drawing
  wordmark down to 36, and a tiny mark + spaced letters below that — a thin
  pane no longer wraps the art into noise. Blocks share one left margin so the
  mark's diagonals stay true at every size.

## [0.6.0]

### Added
- **Branded splash screen** — `openluxe` (and `openluxe help`) now opens with
  the OpenLuxe diamond mark stacked above the wordmark in ASCII, washed in a
  champagne-gold gradient, with version + docs link. Color auto-disables on
  piped output and `NO_COLOR`.

## [0.5.2]

### Added
- Logging in with `OPENLUXE_INSECURE=1` (or `--insecure`) now **remembers the
  choice** in the credentials file, so follow-up commands against the same dev
  server no longer need the flag on every invocation. The remembered opt-in is
  scoped to the saved base URL — pointing `OPENLUXE_API_URL` anywhere else
  stays fully TLS-verified.

## [0.5.1]

### Fixed
- Network failures no longer print a bare "fetch failed": the CLI now surfaces
  the real cause from `error.cause` (TLS, DNS, connection refused) with the
  failing origin and an actionable hint — e.g. a self-signed local certificate
  suggests `OPENLUXE_INSECURE=1`, an unknown host points at `OPENLUXE_API_URL`.
  Applies to all commands including `auth login` (the device-grant handshake
  previously threw the raw error).

## [0.5.0]

### Added
- `contacts create-earnings` — `POST /contacts/{contact}/commission-partnerships/{partnership}/earnings`
  (log a commission earning on a partnership).
- `data-objects create-records` — `POST /data/objects/{object}/records`
  (create a record on a custom data object; complements the existing `upsert`).
  Typed-command surface is now at 100% parity with the public v1 API (317/317).

### Fixed
- CLI version is now single-sourced from `package.json`; the MCP server's
  `serverInfo.version` no longer reports a stale version.

## [0.4.1]

### Added
- **Pro access awareness** — the API/CLI/MCP now require Pro access on your
  account. Commands that hit `402 platform_access_required` print a clear
  "Pro access required" message with the current price and the unlock URL
  (distinct from the per-call `insufficient_credits` 402).

## [0.4.0]

### Added
- **`openluxe mcp`** — an MCP (Model Context Protocol) server over stdio, so
  Claude Code, Cursor, and other MCP clients can drive the OpenLuxe v1 API in a
  chat using your stored CLI token. Lean tool set: `openluxe_list_endpoints` +
  `openluxe_api_request` (full surface) plus typed helpers (`openluxe_me`,
  `openluxe_search`, `openluxe_contacts_list`, `openluxe_create_contact`,
  `openluxe_credits_balance`).
- **`openluxe credits buy`** — open the credit top-up page; AI-generation calls
  are billed at web-app parity.
- **`openluxe manifest`** — emit the typed-command surface as JSON (feeds the
  platform's API-coverage tooling).
- **Full v1 parity** — typed resource commands now mirror the entire public v1
  route table (~315 commands across ~88 resources), generated from the live
  routes and merged with the curated set. The raw `openluxe api <METHOD> <path>`
  passthrough remains for anything bespoke.
- `402 insufficient_credits` responses now print the `topup_url` and a clear
  path to fund, instead of a bare error.

## [0.3.1]
- Added the `smartboards` resource.

## [0.3.0]
- API & CLI Terms of Service awareness: detect `403 api_terms_required`, added
  the `openluxe terms` command and inline acceptance guidance.

## [0.2.0]
- Added `generate` + `generations` commands for async AI generation.

## [0.1.0]
- Initial release: device-flow auth, typed CRM/media/integration resources, and
  the raw `api` passthrough.
