/**
 * BYOA — "use my own agent" delegated generation.
 *
 * A generator app on OpenLuxe (email creator, presentations, website
 * builder, print designer, ad maker) queued a generation request for YOUR
 * agent instead of the platform AI. `openluxe agent listen` waits for the
 * next request, claims it (token-keyed 15-min lease), and prints the full
 * work order as JSON — the host agent (Claude Code etc.) generates the
 * content and submits it back:
 *
 *   openluxe agent listen                      # → claimed delegation JSON
 *   …generate per spec.result_contract…
 *   openluxe delegations submit <uuid> -d '<result json>'
 *
 * Images never travel as URLs — upload first, reference the returned url:
 *   openluxe delegations upload <uuid> ./image.png
 *
 * Zero platform AI credits are charged on this path.
 */
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { request, ApiError } from './api.js';
import { load } from './config.js';

const err = (s) => process.stderr.write(s + '\n');
const isTTY = process.stderr.isTTY;

/**
 * Wait for the next pending delegation, claim it, print it, exit.
 *
 * Flags:
 *   --feature <key>   only pick up one feature (email_template, …)
 *   --timeout <secs>  give up after N seconds (default: wait forever)
 *   --no-claim        print the pending delegation without claiming it
 */
export async function listen(flags = {}) {
    const timeout = flags.timeout ? Number(flags.timeout) : null;
    const deadline = timeout ? Date.now() + timeout * 1000 : null;

    if (isTTY) {
        err('◎ Listening for delegated generation requests…');
        err('  Queue one from any generator app by picking “My agent” as the engine.');
        err('  (Ctrl+C to stop)');
    }

    // Server long-poll (?wait=25) does the heavy lifting; loop re-arms it.
    for (;;) {
        let rows;
        try {
            rows = (await request('GET', '/agent/delegations', {
                query: {
                    status: 'pending',
                    wait: 25,
                    ...(flags.feature ? { feature: flags.feature } : {}),
                },
            })).data ?? [];
        } catch (e) {
            if (e instanceof ApiError && e.status === 429) {
                await sleep(10_000); // rate-limited — back off a beat
                continue;
            }
            throw e;
        }

        if (rows.length > 0) {
            const pending = rows[rows.length - 1]; // oldest first (list is newest-first)

            if (flags['no-claim']) {
                return print(pending);
            }

            try {
                const claimed = await request('POST', `/agent/delegations/${pending.id}/claim`);
                return print(claimed.data ?? claimed);
            } catch (e) {
                // Another agent token won the race — keep listening.
                if (e instanceof ApiError && e.status === 409) continue;
                throw e;
            }
        }

        if (deadline && Date.now() >= deadline) {
            err('✗ No delegation arrived before the timeout.');
            process.exit(1);
        }
    }
}

/**
 * Multipart upload of an image asset for a claimed delegation. The returned
 * `url` is the only image reference the result endpoint accepts.
 */
export async function upload(uuid, filePath) {
    const cfg = load();
    if (!cfg.token) {
        err('✗ Not signed in — run `openluxe auth login` first.');
        process.exit(1);
    }

    const bytes = readFileSync(filePath);
    const form = new FormData();
    form.append('file', new Blob([bytes]), basename(filePath));

    const url = cfg.base.replace(/\/$/, '') + `/api/v1/agent/delegations/${uuid}/assets`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { Accept: 'application/json', Authorization: `Bearer ${cfg.token}` },
        body: form,
    });

    const parsed = await res.json().catch(() => null);
    if (!res.ok) {
        const detail = parsed?.detail || parsed?.message || JSON.stringify(parsed?.errors || parsed) || `HTTP ${res.status}`;
        err(`✗ Upload failed: ${detail}`);
        process.exit(1);
    }

    return print(parsed.data ?? parsed);
}

function print(data) {
    process.stdout.write(JSON.stringify(data, null, 2) + '\n');
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
