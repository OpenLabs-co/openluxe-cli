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

Run `openluxe <resource>` to see its commands, or `openluxe help` for the
full list.

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
