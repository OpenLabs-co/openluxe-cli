#!/usr/bin/env node

// Opt-in escape hatch for self-signed certs (local Herd / staging boxes).
// Default stays fully secure — only relaxes when explicitly requested.
if (process.env.OPENLUXE_INSECURE === '1' || process.argv.includes('--insecure')) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

import { run } from '../src/cli.js';

run(process.argv.slice(2)).catch((e) => {
    console.error(`\x1b[31m✗ ${e?.message || e}\x1b[0m`);
    process.exit(1);
});
