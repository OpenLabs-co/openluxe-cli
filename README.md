# OpenLuxe CLI

One credential. One CLI. **119 apps** — CRM, ERP, real estate, e-commerce,
property management, communities, and more — plus **352 public API
endpoints**, all reachable from your terminal or, more to the point, from
your AI agent's tool-use loop.

## Why this exists

Every other integration your agent uses means another account, another
secret to store, another bespoke tool it has to learn — and more tokens
spent describing tools it half-understands. OpenLuxe is one platform, so
it's **one login** and a small, composable tool surface instead of sixty.

That surface is deliberately *lean* rather than one tool per endpoint —
`openluxe_list_endpoints` to discover, `openluxe_api_request` to call any of
it, plus a handful of typed helpers for the things agents do most. Fewer,
better tools means fewer tokens spent on tool definitions and fewer turns
spent figuring out which one to call.

And it goes the other way too: with **Bring Your Own Agent**, your agent can
*become* the generation engine for OpenLuxe's creator apps — email templates,
presentations, websites, ads, blog posts, and more — using the LLM tokens
you're already paying for, at **zero platform AI credits**. [Jump to
BYOA →](#bring-your-own-agent--be-the-generation-engine)

### Measured, not claimed

We didn't want to just assert an efficiency number, so we built a real
benchmark harness: live calls to real models (Grok 4.3, Gemini 3.5 Flash),
real per-turn token accounting from each provider's own usage response
(never estimated), and task success verified by reading the record back from
the API afterward — never by trusting the model's self-report. It compares
this CLI's shipped MCP tool surface against a naive one-tool-per-endpoint
design, an agent integrating cold from scratch, and a real external
competitor (HubSpot, free tier), on the same tasks:

- **9.2x** fewer tokens than one tool per endpoint
- **2.2x** fewer tokens than an agent integrating from scratch
- **1.5x** fewer tokens than HubSpot's own API, same task
- **100%** task pass rate, vs. **70%** for HubSpot on the same task set

Averaged across both models on the portable task set (the tasks every
architecture, including HubSpot, can attempt). Full methodology, honest
caveats (including where the comparison has real limits — a capped tool
count, a documented HubSpot API quirk, one account and one time window), and
every run browsable by CLI version:
**https://openluxe.co/developers/benchmarks**

## What's inside

119 apps, spanning:

| Category | Apps | Examples |
|---|---|---|
| Business | 27 | General ledger, fixed assets, procurement, inventory, manufacturing, payroll, org chart, property management, business plans, compliance |
| Creative | 17 | AI image/video/presentation/website generation, brand hub, Brickverce spreadsheets, design chat |
| AI Agents | 11 | Alfred, Apollo, Atticus, Odysseus, Eva, Ace, and the workflow/harness system that drives them |
| CRM | 9 | Contacts, pipeline, sequences, deal flow, cultural intelligence, touchpoint auto-logging |
| Real Estate | 9 | Listings, farm campaigns, open houses, MLS search, agreements |
| Communities, Games, Marketplace, Learning, Finance, Escrow | 20+ | — |

Every endpoint is typed and documented — `openluxe describe <resource>
<command>` (or `openluxe describe <METHOD> <path>`) prints the exact
params/body/response schema before you call it, so an agent never has to
guess a shape.

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

### Start from a goal

OpenLuxe's entry point for *work* is the **goal**, not the object — a goal owns
**deliverables** (the things that still have to be *made* for it), and goals
group up into **projects**. The CLI mirrors that whole spine, so an agent can
ask what an ask is in service of, do the work, and attach the result so the
goal's progress actually moves:

```bash
openluxe deliverables list --outstanding 1        # what every goal still needs made
openluxe goals list                               # your objectives + progress %
openluxe projects create -d '{"title":"Miami launch","scope":"business"}'
openluxe goals add-milestone <goal> -d '{"title":"Pre-launch"}'

# plan an object a goal owes, make it, then attach it back:
openluxe deliverables plan <goal> -d '{"title":"Sales deck","expected_type":"sales_presentation"}'
openluxe deliverables fulfil <deliverable> -d '{"resource_type":"sales_presentation","resource_id":918}'
```

The agent SKILL.md's **"Start from a goal"** section teaches this loop end to
end — including the half agents forget: an artifact that isn't attached to its
goal is invisible to the user's plan.

### Storyline decks & scheduled surveys

Author swipeable story decks and drive recurring survey sends from the terminal:

```bash
openluxe storylines frame-types                   # every frame type's schema — read before authoring
openluxe storylines create -d '{"title":"Q3 pulse","steps":[{"frame":{"type":"signup"}}]}'
openluxe storylines create-schedule <uuid> -d '{"cadence":"monthly","contact_list_id":123}'
openluxe storylines schedule-responses <uuid> <schedule>   # sent / opened / responded over time
```

### Jump to the browser

Some things aren't data — you play a mini game, watch a stream, or draw on a
smartboard *in the app*. Browsable resources have an `open` shortcut, and typed
commands grow three output flags:

```bash
openluxe mini-games open            # opens https://openluxe.co/mini-games
openluxe mini-games open wordle     # …/mini-games/wordle
openluxe smartboards open <uuid>    # …/smartboards/<uuid> (smartboards bind by uuid, not id)
openluxe contacts get 42 --web      # print just the record's web URL
openluxe contacts get 42 --open     # print the JSON AND launch the page
openluxe kits list --json           # suppress the ↗ link hint
```

On a TTY, commands print a dim `↗ Open: <url>` hint (on stderr — piped stdout
is always pure JSON, byte-identical for scripts and agents). Records that carry
a `public_url` field use it as the canonical link; otherwise the CLI knows the
hub and id-bound pages.

## Bring Your Own Agent — be the generation engine

OpenLuxe's creator apps normally run the platform's own AI and charge you
credits for it. With **BYOA**, *your* agent does the generating instead —
with the LLM tokens you're already paying for — and the finished content
lands in the app exactly as if platform AI had made it. **Zero platform AI
credits.**

Inside any generator app, the user picks **"My agent"** as the engine; that
queues a *delegation* — a complete work order — for your token. Your agent
claims it, generates with its own model, and submits the result; the human
watches it complete live in the app. Or your agent starts one itself, straight
from the terminal.

Delegable today: **email templates, sales presentations, websites, print
designs, ads, blog articles, brand-color palettes, dossiers, videos, sound
effects, and podcasts.**

```bash
# Wait for the next request from a generator app, claim it, print the work order:
JOB=$(openluxe agent listen)
UUID=$(echo "$JOB" | jq -r '.id')
echo "$JOB" | jq '.spec.result_contract'   # the exact payload to submit

# Generate with your own model, then submit — the response hands you back a
# clickable preview link to the finished asset:
openluxe delegations submit "$UUID" -d '{"subject_line":"Welcome","html":"<html>…</html>"}' | jq -r '.data.preview_url'

# …or kick one off yourself (auto-claims for your token):
openluxe delegations create -d '{"feature":"blog_article","title":"Why Waterfront Wins","layout_type":"magazine"}'

# MAKE CHANGES to an existing asset instead of generating a new one:
openluxe delegations create -d '{"feature":"email_template","mode":"edit","target":123,"instructions":"Make the CTA more urgent and add a P.S."}'

# Need an image / video / audio in the result? Upload it — external URLs are refused:
URL=$(openluxe delegations upload "$UUID" ./hero.png | jq -r '.url')

openluxe delegations list          # what's pending / in flight
openluxe delegations fail "$UUID" --reason "…"   # bail out cleanly if you can't fulfill it
```

**A preview link when it's done.** Every completed submit returns a
`preview_url` — the finished asset's page in the app (or, for media, the direct
CDN url). On a terminal the CLI also prints `↗ Preview: <url>` on stderr. So
from your agent's chat you get a link to click the moment the asset is ready —
no hunting for it in the app.

**Make changes, not just new things.** Pass `"mode":"edit"` with the `target`
id a prior result returned and your change `instructions`; the work order's
`spec.current` carries the asset's current content, and you submit the complete
revised version back through the same contract. Supported for email templates,
blog articles, and dossiers today (websites revise a section at a time via a
normal `create` with `section_id`).

Every submission is **sanitized server-side** before it touches a real
artifact — scripts, iframes, and event handlers are stripped; media must be
uploaded (external URLs are rejected) — so a delegated result is exactly as
safe as a platform-generated one.

**Why it's a win:** you already pay for your agent's model, so BYOA puts those
tokens to work on the platform's creative jobs too — no paying twice for AI,
and your agent drives the entire creator suite instead of you clicking through
it screen by screen.

## For AI agents

Point your agent at the binary. Every endpoint is reachable via the typed
commands or `openluxe api <METHOD> <path>`. Output is always JSON on stdout;
errors go to stderr with a non-zero exit code, so it composes cleanly in
scripts and tool-use loops.

Want your agent to *earn its keep* on the platform? Run `openluxe agent
listen` and it becomes the generation engine for the creator apps — see
[Bring Your Own Agent](#bring-your-own-agent--be-the-generation-engine). The
SKILL.md below teaches the full delegation loop.

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

### Claude Desktop extension (one-click install)

Prefer not to touch JSON config? Download the desktop extension
(`openluxe-<version>.mcpb`) from the
[GitHub releases](https://github.com/OpenLabs-co/openluxe-cli/releases),
double-click it (or drag it into Claude Desktop → Settings → Extensions),
and paste an API token from
[openluxe.co/developers/tokens](https://openluxe.co/developers/tokens).
Build it from source with `node scripts/build-mcpb.mjs`. The extension runs
the same zero-dependency stdio server, authenticated via the `OPENLUXE_TOKEN`
environment variable.

### Connected app in claude.ai / ChatGPT / Grok / Perplexity / Le Chat

Consumer chat apps connect to the hosted server with OAuth — no token or
install at all. Add a custom connector pointing at
`https://openluxe.co/api/v1/mcp`; the platform auto-discovers the OpenLuxe
sign-in and consent flow. Full per-platform guide:
[openluxe.co/connect](https://openluxe.co/connect).

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
