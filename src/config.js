import { homedir } from 'node:os';
import { join } from 'node:path';
import { mkdirSync, readFileSync, writeFileSync, existsSync, chmodSync, rmSync } from 'node:fs';

const DIR = join(homedir(), '.openluxe');
const FILE = join(DIR, 'credentials.json');

/** Single source of truth for the CLI version — read from package.json. */
export const VERSION = JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
).version;

const DEFAULT_BASE = process.env.OPENLUXE_API_URL || 'https://openluxe.co';

export function load() {
    if (!existsSync(FILE)) {
        return { base: DEFAULT_BASE, token: null, user: null };
    }
    try {
        const data = JSON.parse(readFileSync(FILE, 'utf8'));
        return {
            base: process.env.OPENLUXE_API_URL || data.base || DEFAULT_BASE,
            token: data.token || null,
            user: data.user || null,
        };
    } catch {
        return { base: DEFAULT_BASE, token: null, user: null };
    }
}

export function save({ base, token, user }) {
    mkdirSync(DIR, { recursive: true });
    writeFileSync(FILE, JSON.stringify({ base, token, user }, null, 2));
    // Credentials file holds a bearer token — lock it down to the owner.
    try { chmodSync(FILE, 0o600); } catch { /* best effort (e.g. Windows) */ }
}

export function clear() {
    if (existsSync(FILE)) rmSync(FILE);
}

export const credentialsPath = FILE;
