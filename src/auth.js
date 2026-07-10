import { hostname, userInfo } from 'node:os';
import { spawn } from 'node:child_process';
import { load, save, clear, credentialsPath } from './config.js';
import { postPublic } from './api.js';

const DEFAULT_BASE = process.env.OPENLUXE_API_URL || 'https://openluxe.co';

function openBrowser(url) {
    const cmd = process.platform === 'darwin' ? 'open'
        : process.platform === 'win32' ? 'cmd' : 'xdg-open';
    const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
    try {
        const child = spawn(cmd, args, { stdio: 'ignore', detached: true });
        child.on('error', () => {});
        child.unref();
    } catch { /* headless / no browser — the printed URL is the fallback */ }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function login({ base } = {}) {
    // Deliberately NOT load().base: a saved dev base (e.g. openluxe.test) must
    // never silently capture a fresh login — target a dev server explicitly
    // with --base or OPENLUXE_API_URL.
    const apiBase = base || process.env.OPENLUXE_API_URL || DEFAULT_BASE;

    const start = await postPublic(apiBase, '/cli/auth/start', {
        client_name: 'OpenLuxe CLI',
        client_hostname: `${userInfo().username}@${hostname()}`,
    });
    if (!start.ok) {
        console.error(`Could not start login: ${start.data?.detail || start.status}`);
        process.exit(1);
    }

    const { device_code, user_code, verification_uri_complete, verification_uri, interval, expires_in } = start.data;

    console.log('');
    console.log(`  Signing in to \x1b[1m${apiBase}\x1b[0m`);
    console.log('');
    console.log('  Authorize this device by visiting:');
    console.log(`    \x1b[36m${verification_uri_complete || verification_uri}\x1b[0m`);
    console.log('');
    console.log(`  Confirm this code:  \x1b[1m${user_code}\x1b[0m`);
    console.log('');
    console.log('  Opening your browser… (sign in if prompted, then approve)');
    console.log('');
    openBrowser(verification_uri_complete || verification_uri);

    const deadline = Date.now() + expires_in * 1000;
    let wait = (interval || 5) * 1000;

    while (Date.now() < deadline) {
        await sleep(wait);
        const poll = await postPublic(apiBase, '/cli/auth/poll', { device_code });

        if (poll.ok && poll.data?.status === 'authorized') {
            // Logging in with TLS verification relaxed (OPENLUXE_INSECURE=1 /
            // --insecure) remembers that choice for this base, so follow-up
            // commands against the same dev server don't need the flag.
            const insecure = process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0';
            save({ base: apiBase, token: poll.data.token, user: poll.data.user, insecure });
            const who = poll.data.user?.email || poll.data.user?.name || 'your account';
            console.log(`\x1b[32m✓ Signed in as ${who}\x1b[0m`);
            console.log(`  Token stored at ${credentialsPath}`);
            if (insecure) console.log('  TLS verification stays relaxed for this server (remembered from login).');
            console.log('');
            console.log('  Your API use is governed by the OpenLuxe API & CLI Terms');
            console.log(`  and all referenced policies — see \x1b[36m${apiBase}/api-terms\x1b[0m`);
            console.log("  (run `openluxe terms`). Authorizing this device recorded");
            console.log("  your acceptance; you'll be re-prompted only if they change.");
            return;
        }
        if (poll.ok && poll.data?.status === 'pending') {
            continue; // keep waiting
        }
        if (poll.status === 429) {
            wait += 2000; // server asked us to slow down
            continue;
        }
        if (poll.status === 410 || poll.status === 403) {
            console.error(`\x1b[31m✗ ${poll.data?.detail || 'Authorization failed.'}\x1b[0m`);
            process.exit(1);
        }
    }
    console.error('\x1b[31m✗ Timed out waiting for authorization.\x1b[0m');
    process.exit(1);
}

export function logout() {
    const { user } = load();
    clear();
    console.log('Signed out locally. The token still exists server-side —');
    console.log('revoke it at Settings → Integrations if this device is compromised.');
    if (user?.email) console.log(`(was: ${user.email})`);
}

export function status() {
    const { base, token, user } = load();
    if (!token) {
        console.log('Not signed in. Run:  openluxe auth login');
        process.exit(1);
    }
    console.log(`Signed in:  ${user?.email || user?.name || 'unknown'}`);
    console.log(`API:        ${base}`);
    console.log(`Credentials ${credentialsPath}`);
}
