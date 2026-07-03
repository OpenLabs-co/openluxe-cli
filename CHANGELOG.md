# Changelog

All notable changes to `@openluxeco/cli` are documented here. This project
adheres to [Semantic Versioning](https://semver.org/).

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
