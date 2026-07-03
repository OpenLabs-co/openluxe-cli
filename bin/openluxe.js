#!/usr/bin/env node

import { run } from '../src/cli.js';
import { load } from '../src/config.js';

// Opt-in escape hatch for self-signed certs (local Herd / staging boxes).
// Default stays fully secure — relaxes only when explicitly requested, or when
// this device was logged in with the flag (remembered per saved base URL).
if (process.env.OPENLUXE_INSECURE === '1' || process.argv.includes('--insecure') || load().insecure) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

run(process.argv.slice(2)).catch((e) => {
    console.error(`\x1b[31m✗ ${e?.message || e}\x1b[0m`);
    process.exit(1);
});
