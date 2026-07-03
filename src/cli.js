import { request, ApiError } from './api.js';
import { RESOURCES } from './resources.js';
import * as auth from './auth.js';
import { load, VERSION } from './config.js';
import { serve as mcpServe } from './mcp.js';
import { banner } from './banner.js';
import { skillText, install as installSkill } from './skill.js';

const C = {
    dim: (s) => `\x1b[2m${s}\x1b[0m`,
    bold: (s) => `\x1b[1m${s}\x1b[0m`,
    cyan: (s) => `\x1b[36m${s}\x1b[0m`,
    red: (s) => `\x1b[31m${s}\x1b[0m`,
};

/**
 * Tokenize argv into { positionals, flags, body }.
 *   --key value | --key=value | --flag (boolean) | -d '<json>'
 */
function parseArgs(argv) {
    const positionals = [];
    const flags = {};
    let body;
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '-d' || a === '--data') {
            const raw = argv[++i];
            try { body = JSON.parse(raw); } catch { die(`-d expects valid JSON, got: ${raw}`); }
        } else if (a.startsWith('--')) {
            const eq = a.indexOf('=');
            if (eq !== -1) {
                flags[a.slice(2, eq)] = a.slice(eq + 1);
            } else {
                const key = a.slice(2);
                const next = argv[i + 1];
                if (next === undefined || next.startsWith('--')) {
                    flags[key] = true;
                } else {
                    flags[key] = next;
                    i++;
                }
            }
        } else {
            positionals.push(a);
        }
    }
    return { positionals, flags, body };
}

function die(msg) {
    console.error(C.red(`✗ ${msg}`));
    process.exit(1);
}

function out(data) {
    process.stdout.write(typeof data === 'string' ? data + '\n' : JSON.stringify(data, null, 2) + '\n');
}

/** The server hard-blocks every call until the API & CLI Terms are accepted. */
function isTermsBlock(e) {
    return e?.status === 403
        && typeof e?.body?.type === 'string'
        && e.body.type.endsWith('/api_terms_required');
}

/** The API/CLI/MCP are Pro surfaces — blocked until the user unlocks Pro access. */
function isPlatformAccessBlock(e) {
    return e?.status === 402
        && ((typeof e?.body?.type === 'string' && e.body.type.endsWith('/platform_access_required'))
            || e?.body?.error === 'platform_access_required');
}

function printPlatformAccessBlock(body = {}) {
    const url = body.upgrade_url || body.landing_url || `${load().base}/pro`;
    const price = typeof body.price_cents === 'number' ? `$${(body.price_cents / 100).toLocaleString()}` : null;
    console.error(C.red('✗ Pro access required'));
    console.error('');
    console.error('  The OpenLuxe API, CLI, and MCP server are part of the Pro suite.');
    console.error(`  Unlock Pro access${price ? ` (${price} today)` : ''} to use them.`);
    console.error('');
    console.error(`  Unlock here:  ${C.cyan(url)}`);
    console.error(C.dim('  Then re-run your command.'));
}

function printTermsBlock(body = {}) {
    const acceptUrl = body.accept_url || `${load().base}/developers`;
    console.error(C.red('✗ API & CLI Terms acceptance required'));
    console.error('');
    console.error('  Before using the API you must read and accept the current');
    console.error('  OpenLuxe API & CLI Terms of Service and every referenced policy.');
    console.error('  This is a one-time, in-browser step (it re-prompts only when');
    console.error('  the terms change).');
    console.error('');
    console.error(`  Sign in and accept here:  ${C.cyan(acceptUrl)}`);
    if (Array.isArray(body.required_policies) && body.required_policies.length) {
        console.error('');
        console.error('  You will be asked to accept:');
        for (const p of body.required_policies) {
            console.error(`    • ${p.title}${p.url ? C.dim('  ' + p.url) : ''}`);
        }
    }
    console.error('');
    console.error(C.dim('  Then re-run your command.'));
}

/** A billable call hit a credit shortfall — surface the top-up path (no in-app modal here). */
function printInsufficientCredits(body = {}) {
    const { base } = load();
    const topup = body.topup_url || `${base}/credits/buy`;
    console.error(C.red('✗ 402 Insufficient credits'));
    if (body.message) console.error(`  ${body.message}`);
    if (body.required_credits !== undefined) {
        console.error(C.dim(`  required: ${body.required_credits}  available: ${body.available_credits ?? 0}  type: ${body.credit_type ?? 'credits'}`));
    }
    console.error('');
    console.error(`  Top up here:  ${C.cyan(topup)}`);
    console.error(C.dim('  Then re-run your command.'));
}

/** `openluxe credits buy` — open / print the credit top-up page. */
function creditsBuy(flags = {}) {
    const { base } = load();
    const url = new URL(`${base.replace(/\/$/, '')}/credits/buy`);
    if (flags.topup) url.searchParams.set('topup', flags.topup);
    if (flags.required) url.searchParams.set('required', flags.required);
    url.searchParams.set('label', flags.label || 'API credit top-up');
    console.log(`Open this page to buy OpenLuxe credits:\n\n  ${C.cyan(url.toString())}\n`);
    console.log(C.dim('Credits fund AI-generating API calls (openluxe generate ...) at the same cost as the web app.'));
}

function termsHelp() {
    const { base } = load();
    console.log(`
${C.bold('openluxe terms')} — API & CLI Terms of Service

  Using the OpenLuxe API or CLI is governed by a binding agreement.
  You must read and accept it (and every referenced policy) once, in
  your browser while signed in, before any request will work. You'll
  be re-prompted only if the terms materially change.

  Accept / review:
    API & CLI Terms     ${C.cyan(base + '/api-terms')}
    Terms of Service    ${C.cyan(base + '/terms-of-service')}
    Privacy Policy      ${C.cyan(base + '/privacy-policy')}
    Acceptable Use      ${C.cyan(base + '/acceptable-use')}
    Data Policy         ${C.cyan(base + '/data-policy')}
    Cookie Policy       ${C.cyan(base + '/cookie-policy')}

  Accept from:          ${C.cyan(base + '/developers')}
`);
}

async function callApi(method, path, { positionals = [], flags = {}, body }) {
    // Fill :placeholders from --flag of the same name, else positionals in order.
    const used = new Set();
    let pi = 0;
    const filled = path.replace(/:([A-Za-z_]+)/g, (_, name) => {
        if (flags[name] !== undefined) { used.add(name); return encodeURIComponent(flags[name]); }
        const v = positionals[pi++];
        if (v === undefined) die(`Missing path argument: ${name}`);
        return encodeURIComponent(v);
    });

    const rest = {};
    for (const [k, v] of Object.entries(flags)) if (!used.has(k)) rest[k] = v;

    let query, payload;
    if (method === 'GET' || method === 'DELETE') {
        query = rest;
    } else {
        payload = { ...(body || {}), ...rest };
        if (Object.keys(payload).length === 0) payload = body;
    }

    try {
        const res = await request(method, filled, { query, body: payload });
        out(res);
    } catch (e) {
        if (e instanceof ApiError) {
            if (isTermsBlock(e)) {
                printTermsBlock(e.body);
                process.exit(1);
            }
            if (isPlatformAccessBlock(e)) {
                printPlatformAccessBlock(e.body || {});
                process.exit(1);
            }
            if (e.status === 402) {
                printInsufficientCredits(e.body || {});
                process.exit(1);
            }
            console.error(C.red('✗ ' + (e.status ? e.status + ' ' : '') + e.message));
            if (e.body && typeof e.body === 'object') console.error(C.dim(JSON.stringify(e.body, null, 2)));
            if (e.status === 401) console.error(C.dim('  Run: openluxe auth login'));
            process.exit(1);
        }
        die(e.message);
    }
}

function topHelp() {
    const { token, user, base } = load();
    // The splash is for humans — piped/captured help (AI agents, scripts)
    // gets straight to the commands without paying for the art.
    if (process.stdout.isTTY) console.log(banner());
    console.log(`
${C.bold('openluxe')} — OpenLuxe API command-line client

${C.bold('USAGE')}
  openluxe <command> [args] [--flags] [-d '<json>']

${C.bold('AUTH')}
  auth login                Sign in via your browser (device flow)
  auth logout               Forget the local token
  auth status               Show who you're signed in as
  terms                     Review / accept the API & CLI Terms

${C.bold('RAW')}
  api <METHOD> <path>       Call any v1 endpoint directly
                            e.g. openluxe api GET /contacts --per_page 5
                                 openluxe api POST /notes -d '{"contact_id":1,"body":"hi"}'

${C.bold('AI / MCP')}
  mcp                       Run an MCP server over stdio (point Claude Code,
                            Cursor, etc. at this to drive OpenLuxe in chat)
  skill install             Install the OpenLuxe agent skill into Claude Code
                            (--project for repo-local, --codex for ~/.codex/AGENTS.md)
  skill show                Print the agent skill (SKILL.md)
  describe <res> <cmd>      Input/output schema for a command (or: describe POST /notes)
  credits buy               Open the credit top-up page (funds AI calls)
  manifest                  Print the typed-command surface as JSON

${C.bold('RESOURCES')}
${Object.entries(RESOURCES).map(([g, r]) => `  ${g.padEnd(16)} ${C.dim(r.summary)}`).join('\n')}

  Run ${C.cyan('openluxe <resource>')} to see its commands.

${C.bold('STATE')}
  ${token ? `signed in as ${user?.email || 'unknown'}` : 'not signed in — run: openluxe auth login'}
  API: ${base}
`);
}

function groupHelp(group) {
    const r = RESOURCES[group];
    console.log(`\n${C.bold('openluxe ' + group)} — ${r.summary}\n`);
    for (const [name, c] of Object.entries(r.commands)) {
        console.log(`  ${(group + ' ' + name).padEnd(28)} ${C.dim(`${c.method} ${c.path}`)}${c.summary ? '  ' + c.summary : ''}`);
    }
    console.log('');
}

export async function run(argv) {
    const [cmd, ...rest] = argv;

    if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') return topHelp();
    if (cmd === '--version' || cmd === '-v') return out('openluxe ' + VERSION);
    if (cmd === 'terms') return termsHelp();

    // MCP server over stdio — point Claude Code / Cursor at `openluxe mcp`.
    if (cmd === 'mcp') return mcpServe();

    // The OpenLuxe agent skill — print it or install it into an AI agent.
    if (cmd === 'skill') {
        const sub = rest[0];
        const { flags } = parseArgs(rest.slice(1));
        if (sub === 'show') return console.log(skillText());
        if (sub === 'install') {
            const file = installSkill({ project: Boolean(flags.project), codex: Boolean(flags.codex) });
            console.log(`✓ OpenLuxe agent skill installed → ${file}`);
            if (flags.codex) console.log('  (managed block in AGENTS.md — re-run to update, other content untouched)');
            else console.log("  Claude Code picks it up automatically; ask your agent about 'openluxe'.");
            return;
        }
        return die('usage: openluxe skill show | skill install [--project | --codex]');
    }

    // Input/output schema for one endpoint — the agent's field-name lookup.
    //   openluxe describe <resource> <command>
    //   openluxe describe <METHOD> </path>
    if (cmd === 'describe') {
        const [a, b] = rest;
        if (!a || !b) return die("usage: openluxe describe <resource> <command>  |  openluxe describe POST /notes");
        let method, path, scope = null;
        if (/^(GET|POST|PUT|PATCH|DELETE)$/i.test(a)) {
            method = a.toUpperCase();
            path = b;
        } else {
            const spec = RESOURCES[a]?.commands?.[b];
            if (!spec) return die(`Unknown command: ${a} ${b}. Run 'openluxe ${a}' or 'openluxe manifest'.`);
            method = spec.method;
            path = spec.path;
            scope = (spec.summary?.match(/\[scope: ([^\]]+)\]/) || [])[1] || null;
        }
        // The typed map uses :param — the OpenAPI doc uses {param}.
        const specPath = path.replace(/:([A-Za-z_]+)/g, '{$1}');
        const schema = await request('GET', '/developers/reference/schema', {
            query: { method, path: specPath },
            prefix: '',
        }).catch(() => null);
        if (!schema) return die(`No schema available for ${method} ${specPath} — see /developers/reference.`);
        if (scope && !schema.scope) schema.scope = scope;
        if (!schema.body && method !== 'GET') {
            schema.body_note = 'Body fields not statically typed — send a best-guess payload and read the 422 response: it names every missing/invalid field.';
        }
        return out(schema);
    }

    // Emit the typed-command surface as JSON (feeds the coverage tooling).
    if (cmd === 'manifest') {
        const commands = [];
        for (const [resource, def] of Object.entries(RESOURCES)) {
            for (const [command, spec] of Object.entries(def.commands)) {
                commands.push({ resource, command, method: spec.method, path: spec.path, summary: spec.summary || null });
            }
        }
        return out({ version: VERSION, count: commands.length, commands });
    }

    if (cmd === 'auth') {
        const sub = rest[0];
        const { flags } = parseArgs(rest.slice(1));
        if (sub === 'login') return auth.login({ base: flags.base });
        if (sub === 'logout') return auth.logout();
        if (sub === 'status') return auth.status();
        return die(`Unknown auth command: ${sub || '(none)'} — try login | logout | status`);
    }

    if (cmd === 'api') {
        const method = (rest[0] || '').toUpperCase();
        const path = rest[1];
        if (!method || !path) return die("usage: openluxe api <METHOD> <path> [-d '<json>'] [--query val]");
        const { flags, body } = parseArgs(rest.slice(2));
        return callApi(method, path, { flags, body });
    }

    // `credits buy` opens the top-up page (not an API call).
    if (cmd === 'credits' && rest[0] === 'buy') {
        const { flags } = parseArgs(rest.slice(1));
        return creditsBuy(flags);
    }

    const group = RESOURCES[cmd];
    if (!group) return die(`Unknown command: ${cmd}. Run 'openluxe help'.`);

    const subName = rest[0];
    if (!subName || subName === '--help' || subName === '-h') return groupHelp(cmd);

    const command = group.commands[subName];
    if (!command) return die(`Unknown '${cmd}' command: ${subName}. Run 'openluxe ${cmd}' for options.`);

    const { positionals, flags, body } = parseArgs(rest.slice(1));
    return callApi(command.method, command.path, { positionals, flags, body });
}
