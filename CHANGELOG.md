# Changelog

All notable changes to `@openluxeco/cli` are documented here. This project
adheres to [Semantic Versioning](https://semver.org/).

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
