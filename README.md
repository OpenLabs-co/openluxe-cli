# OpenLuxe CLI

The official command-line client for the OpenLuxe v1 API. Built for humans
and for terminal AI agents (Claude Code, etc.) — sign in once with your
OpenLuxe web account, then drive the whole API from the shell.

## Install

```bash
npm install -g @openluxeco/cli
# or run without installing:
npx @openluxeco/cli help
```

Requires Node.js 18+.

## Sign in

```bash
openluxe auth login
```

This uses the OAuth 2.0 device flow — exactly like signing in to other
modern CLIs:

1. The CLI prints a short code and opens your browser.
2. You sign in to openluxe.co (if not already) and approve the device.
3. The CLI receives a personal access token and stores it at
   `~/.openluxe/credentials.json` (chmod 600).

It works headless / over SSH too — the URL + code are printed, so you can
open them on any device.

```bash
openluxe auth status     # who am I?
openluxe auth logout      # forget the local token
```

Revoke a CLI token anytime from **Settings → Integrations** on the web.

## Terms of Service

Use of the API and this CLI is governed by a binding agreement. Before any
request will succeed you must read and accept the **OpenLuxe API & CLI Terms
of Service** and every referenced policy (Terms of Service, Privacy, Acceptable
Use, Data, Cookie). This is a one-time, in-browser step — authorizing the
device during `openluxe auth login` records your acceptance. You are
re-prompted only if the terms materially change (e.g. pricing, rate limits,
discontinued endpoints).

If a token predates the current terms (or they changed), every call returns
`403` and the CLI tells you exactly where to accept. Review anytime:

```bash
openluxe terms
```

Key points: the API and CLI are provided "as is" with no uptime guarantee;
endpoints, pricing, credits, and rate limits may change or be discontinued at
any time without liability; AI-generated output may be inaccurate and must be
independently verified. Full text: `https://openluxe.co/api-terms`.

## Pro access

The OpenLuxe API, this CLI, and the MCP server are part of the **Pro suite** —
using them requires unlocking Pro access on your account (the same one-time
platform access that gates the Pro apps in the web app). Until you unlock it,
commands return:

```
✗ Pro access required
  The OpenLuxe API, CLI, and MCP server are part of the Pro suite.
  Unlock Pro access ($99 today) to use them.

  Unlock here:  https://openluxe.co/onboarding/access
```

Authorizing the CLI (`openluxe auth login`) is also blocked in the browser until
you unlock access. Admins and grandfathered accounts are exempt.

## Use it

Typed resource commands:

```bash
openluxe contacts list --per_page 5
openluxe contacts get 42
openluxe notes create --contact 42 --body "Followed up by phone"
openluxe render create -d '{"surface":"crm.dashboard","format":"pdf"}'
openluxe webhooks events
openluxe me show
```

AI generation is async — start a job, then poll the returned handle:

```bash
# start (returns { data: { id, status, status_url } } with HTTP 202)
openluxe generate start image -d '{"prompt":"a marble villa at golden hour"}'
openluxe generate start agent_odysseus -d '{"message":"brief me before the meeting"}'

# poll until status is succeeded | failed
openluxe generations get <id>
```

Generations are charged the same credits as the equivalent in-app action; a
shortfall returns `402` with a `topup_url`. Run `openluxe <resource>` to see
its commands, or `openluxe help` for the full list.

Raw passthrough to any v1 endpoint:

```bash
openluxe api GET /contacts --per_page 5
openluxe api POST /notes -d '{"contact_id":1,"body":"hi"}'
openluxe api DELETE /notes/9
```

### Jump to the browser

Some things aren't data — you play a mini game, watch a stream, or draw on a
smartboard *in the app*. Browsable resources have an `open` shortcut, and typed
commands grow three output flags:

```bash
openluxe mini-games open            # opens https://openluxe.co/mini-games
openluxe mini-games open wordle     # …/mini-games/wordle
openluxe smartboards open 42        # …/smartboards/42
openluxe contacts get 42 --web      # print just the record's web URL
openluxe contacts get 42 --open     # print the JSON AND launch the page
openluxe kits list --json           # suppress the ↗ link hint
```

On a TTY, commands print a dim `↗ Open: <url>` hint (on stderr — piped stdout
is always pure JSON, byte-identical for scripts and agents). Records that carry
a `public_url` field use it as the canonical link; otherwise the CLI knows the
hub and id-bound pages.

## For AI agents

Point your agent at the binary. Every endpoint is reachable via the typed
commands or `openluxe api <METHOD> <path>`. Output is always JSON on stdout;
errors go to stderr with a non-zero exit code, so it composes cleanly in
scripts and tool-use loops.

**Install the agent skill** — a SKILL.md that teaches your agent the whole
platform (surfaces, auth, discovery, the error contract, recipes, rules):

```bash
openluxe skill install            # Claude Code: ~/.claude/skills/openluxe/
openluxe skill install --project  # repo-local: ./.claude/skills/openluxe/
openluxe skill install --codex    # OpenAI Codex: managed block in ~/.codex/AGENTS.md
openluxe skill show               # print it (any agent can just read it)
```

**Claude Code plugin** — the skill plus the MCP server, one install:

```
/plugin marketplace add OpenLabs-co/openluxe-cli
/plugin install openluxe@openluxe
```

**Look up any endpoint's schema** before calling it:

```bash
openluxe describe contacts create     # typed command → params/body/response
openluxe describe POST /notes         # any raw endpoint
```

```bash
export OPENLUXE_API_URL=https://openluxe.co   # default; override for staging/local
```

## MCP (Model Context Protocol)

`openluxe mcp` runs an MCP server over stdio, so any MCP-aware client
(Claude Code, Claude Desktop, Cursor, …) can drive OpenLuxe in a chat. It
authenticates with your stored CLI token and proxies to the v1 API — the agent
gets the same scoped, ToS-gated, billed surface you do.

Sign in once (`openluxe auth login`), then register the server with your client.
Example MCP client config:

```json
{
  "mcpServers": {
    "openluxe": { "command": "openluxe", "args": ["mcp"] }
  }
}
```

It exposes a lean tool set — `openluxe_list_endpoints` to discover the full v1
surface and `openluxe_api_request` to call any of it, plus typed helpers
(`openluxe_me`, `openluxe_search`, `openluxe_contacts_list`,
`openluxe_create_contact`, `openluxe_credits_balance`). OpenLuxe also hosts a
remote MCP server at `https://openluxe.co/api/v1/mcp` (Bearer-authed with a
`ol_itk_` token) for clients that speak Streamable HTTP directly.

## Credits

AI-generating calls (`openluxe generate …`) cost credits at web-app parity. A
shortfall returns `402` with a top-up link; you can also open it anytime:

```bash
openluxe credits balance
openluxe credits buy
```

## Environment

| Var | Purpose |
|---|---|
| `OPENLUXE_API_URL` | API base (default `https://openluxe.co`) |
| `OPENLUXE_INSECURE=1` | Skip TLS verification — only for self-signed local/staging boxes (or pass `--insecure`). Off by default. |

Credentials: `~/.openluxe/credentials.json`
