import { request, ApiError } from './api.js';
import { RESOURCES } from './resources.js';
import * as auth from './auth.js';
import { load } from './config.js';

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
            console.error(C.red(`✗ ${e.status} ${e.message}`));
            if (e.body && typeof e.body === 'object') console.error(C.dim(JSON.stringify(e.body, null, 2)));
            if (e.status === 401) console.error(C.dim('  Run: openluxe auth login'));
            process.exit(1);
        }
        die(e.message);
    }
}

function topHelp() {
    const { token, user, base } = load();
    console.log(`
${C.bold('openluxe')} — OpenLuxe API command-line client

${C.bold('USAGE')}
  openluxe <command> [args] [--flags] [-d '<json>']

${C.bold('AUTH')}
  auth login                Sign in via your browser (device flow)
  auth logout               Forget the local token
  auth status               Show who you're signed in as

${C.bold('RAW')}
  api <METHOD> <path>       Call any v1 endpoint directly
                            e.g. openluxe api GET /contacts --per_page 5
                                 openluxe api POST /notes -d '{"contact_id":1,"body":"hi"}'

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
    if (cmd === '--version' || cmd === '-v') return out('openluxe 0.1.0');

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

    const group = RESOURCES[cmd];
    if (!group) return die(`Unknown command: ${cmd}. Run 'openluxe help'.`);

    const subName = rest[0];
    if (!subName || subName === '--help' || subName === '-h') return groupHelp(cmd);

    const command = group.commands[subName];
    if (!command) return die(`Unknown '${cmd}' command: ${subName}. Run 'openluxe ${cmd}' for options.`);

    const { positionals, flags, body } = parseArgs(rest.slice(1));
    return callApi(command.method, command.path, { positionals, flags, body });
}
