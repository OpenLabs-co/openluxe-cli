# Changelog

All notable changes to `@openluxeco/cli` are documented here. This project
adheres to [Semantic Versioning](https://semver.org/).

## [0.16.0]

### Added
- **Shared video playback in live rooms.** A host can play a video from their
  library into a livestream/webinar so every attendee sees the *same second* of
  it, and the CLI can drive it:
  - `livestreams video <room>` — what's playing and where everyone is up to
    (state, `position_seconds`, signed `stream_url`). The position is derived
    server-side, so a late joiner lands on the right second.
  - `livestreams play <room> -d '<json>'` — one reconciling command for the
    whole transport: `{"video_id":123}` to start, `{"state":"paused"}` /
    `{"state":"playing"}` to pause/resume, `{"position_seconds":90}` to seek,
    `{"state":"stopped"}` to clear. Scoped `media:livestreams:write`.

  Unlike going live, this needs no camera — it's what a control-room script
  automates, which is why it's on the API at all.
- **Webinar polls.** `webinars polls <id>` returns each host-pushed poll with
  its tally; `webinars push-poll <id> -d '{"question":"…","options":["Yes","No"]}'`
  asks the room mid-call (`409` if no episode is live).
- **`video-gates`** — video-gated meeting bookings, where a prospect must watch
  something before their invite is released. `list` (filter
  `--gate_status pending|passed|expired`), `get <booking_uuid>`, and `configs`
  (which meeting types are gated, and behind what). Scoped
  `scheduling:gates:read`, read-only — releasing a hold through the API would
  defeat the gate.

  The `expired` rows are the useful ones: a lapsed hold leaves a cancelled
  booking with no indication *why* anywhere else in the API, so this is the only
  place that says "they booked, watched 20%, and never came back".

- **`pitches`, `pitch-sources` and `fund`** — the whole "get a film made"
  surface, writable end to end.

  A **pitch** is the project: logline, synopsis, script, budget, talent roles,
  cast, characters, scenes, references, rights, the legal entity behind it, and
  the **rooms** a visitor walks through — each one public, behind a signature,
  behind your approval, or behind ID verification. `pitches create/update/
  publish`, `add-room`/`room-access`, `add-item`/`attachable`,
  `add-agreement`/`signers`, `sync-milestones`, `analytics`.

  `fund` is **rewards crowdfunding in real money**: `fund create` starts a draft
  against one of your pitches, `add-tier`/`add-reward` price what a backer gets,
  and `fund launch` takes it live. Also `post-update`, `late-pledges`,
  `seeking-match` and the private `matches` queue.

  ⚠️ **Run `pitches vocabulary` and `fund vocabulary` first.** They return every
  valid genre, rating, direction, room-item type and tier/reward field name in
  one call. A reward tier's headline field is `name`, not `title`, and amounts
  are integer cents — guessing either costs a round-trip per 422.

  ⛔ **Two separate money rails hang off a pitch, and they are not
  interchangeable.** `fund` sells a REWARD for cash and promises no return of any
  kind; `pitches investment-tiers` sells a royalty percentage for platform
  credits under a signed agreement, released per milestone from escrow. A project
  may run both. Never sum, compare, or describe one as the other.

  ⛔ **On Film Fund surfaces the vocabulary is a legal constraint, not a style
  note:** backers, supporters, matching partners, rewards, pledges — never
  "investors", never "returns", never "ROI". OpenLuxe is not a broker or a
  funding portal, and copy written here lands on a public campaign page.

  ⛔ **Not exposed, deliberately:** pledging, guest pledging, SCA recovery,
  subscribing, investing, escrow releases, and *offering* a match — each one
  charges a real card. Access grants, invitations and signing an agreement are
  also out: the first two email a real person about a confidential project, and
  a signature is a legal act by a named person. `fund launch` is refused with a
  422 naming what is missing until the filmmaker's identity is verified.

- **Storyline deck editing, translation, and client intakes.**
  - Five single-slide commands — `add-step`, `update-step`, `reorder-steps`,
    `duplicate-step`, `delete-step` — plus `replace-step`. `set-steps` replaces
    ALL slides, so revising a deck used to mean re-sending every slide you did
    not want to touch: wasteful on a 30-slide deck, and a real chance of
    dropping one you failed to round-trip.
  - AI authoring: `generate` / `generate-status` (writes a whole deck from a
    topic — ⚠️ REPLACES the current slides), `draft-step` with the
    `accept-draft` / `reject-draft` pending-frame loop, and `texture`. All
    credit-charged.
  - `translations` / `translate` / `delete-translation` — the SAME public link
    plays in another language via `?lang=`, which is how a deck reaches an
    audience its author does not share a language with. `translations` is free;
    run it before paying.
  - Collaboration: `collaborators`, `share`, `update-collaborator`, `unshare`,
    `transfer-ownership` (flagged irreversible in its own summary — the caller
    drops to editor and only the new owner can hand it back), plus deck and
    per-slide `comments`.
  - Palettes, folders and the public deck index at `/storyline/u/{handle}`:
    `update-palette` rewrites in place, because deleting and re-creating one
    changes its `custom-{id}` key and silently unsets the scheme on every deck
    using it. `palette-brands` returns the user's REAL brand hexes so a deck
    stops guessing at them.
  - Reference data that needs no account context: `frame-patterns`,
    `document-presets`, `intake-presets`.
- **`intakes`** — a storyline SENT to a client to collect answers, documents and
  a signature, which had no CLI surface at all. `list`, `get`, `send`,
  `review-document`, `release-gate`, `cancel`.

  ⚠️ `send` carries its own scope (`intakes:send`) because it emails a real
  person — `intakes:write` (reviewing a document) does not grant it.
  ⛔ `get` never returns document BYTES or OCR text. Those are KYC and identity
  scans; they are not reachable with a bearer string.

## [0.15.0]

Published 2026-07-27 without a changelog entry; recorded here after the fact.

### Added
- **`websites`** — the v1 redesign chain: `discover` a domain's pages, `ingest`
  the ones worth keeping, and `apply` them as the AI website builder's sitemap.
  Reads structure and content (headings, copy, CTAs, navigation), never markup:
  it rebuilds a site's purpose in a new design language and is deliberately not
  a cloner. Scraping is billed per page.

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
