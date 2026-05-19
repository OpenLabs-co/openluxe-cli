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

## For AI agents

Point your agent at the binary. Every endpoint is reachable via the typed
commands or `openluxe api <METHOD> <path>`. Output is always JSON on stdout;
errors go to stderr with a non-zero exit code, so it composes cleanly in
scripts and tool-use loops.

```bash
export OPENLUXE_API_URL=https://openluxe.co   # default; override for staging/local
```

## Environment

| Var | Purpose |
|---|---|
| `OPENLUXE_API_URL` | API base (default `https://openluxe.co`) |
| `OPENLUXE_INSECURE=1` | Skip TLS verification — only for self-signed local/staging boxes (or pass `--insecure`). Off by default. |

Credentials: `~/.openluxe/credentials.json`
