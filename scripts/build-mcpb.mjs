#!/usr/bin/env node
/**
 * Builds the Claude Desktop extension (.mcpb) — a one-click-install bundle
 * of the CLI's stdio MCP server. Users double-click the file (or drag it
 * into Claude Desktop → Settings → Extensions), paste an OpenLuxe API token
 * from https://openluxe.co/developers/tokens, and every chat can drive the
 * OpenLuxe v1 API.
 *
 * Stages dist-mcpb/ (manifest + entry + the zero-dependency src/) and packs
 * it with the official toolchain:  node scripts/build-mcpb.mjs
 * Output: dist/openluxe-<version>.mcpb
 */
import { cpSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const stage = join(root, 'dist-mcpb');
const out = join(root, 'dist');
const { version, description } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

rmSync(stage, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });
mkdirSync(out, { recursive: true });

cpSync(join(root, 'src'), join(stage, 'src'), { recursive: true });
cpSync(join(root, 'LICENSE'), join(stage, 'LICENSE'));

// The staged bundle is its own tiny ESM package; src/config.js reads the
// version from ../package.json, so this file is load-bearing.
writeFileSync(join(stage, 'package.json'), JSON.stringify({
    name: 'openluxe-mcpb',
    version,
    type: 'module',
    private: true,
}, null, 2));

writeFileSync(join(stage, 'main.js'), [
    "// Claude Desktop launches this with OPENLUXE_TOKEN / OPENLUXE_API_URL",
    "// from the user's extension settings (see manifest.json user_config).",
    "import { serve } from './src/mcp.js';",
    '',
    'serve();',
    '',
].join('\n'));

writeFileSync(join(stage, 'manifest.json'), JSON.stringify({
    manifest_version: '0.2',
    name: 'openluxe',
    display_name: 'OpenLuxe',
    version,
    description: 'Drive OpenLuxe from Claude — CRM, listings, business tools, AI generation.',
    long_description: [
        'Connects Claude Desktop to your OpenLuxe account through the OpenLuxe v1 API. ',
        'Ask Claude to manage CRM contacts, search your records, read business/ERP data, ',
        'check credits, or call any of the ~300 API endpoints. Your API token\'s ability ',
        'scopes are enforced on every call, and AI-generating calls bill your OpenLuxe ',
        'credits exactly like in-app usage. Create a token at ',
        'https://openluxe.co/developers/tokens (Pro access required).',
    ].join(''),
    author: { name: 'Open Labs LLC', url: 'https://openluxe.co' },
    homepage: 'https://openluxe.co/developers/mcp',
    documentation: 'https://openluxe.co/developers/mcp',
    support: 'https://openluxe.co/developers',
    license: 'MIT',
    keywords: ['openluxe', 'crm', 'real-estate', 'business', 'api', 'erp', 'ai'],
    privacy_policies: ['https://openluxe.co/privacy-policy'],
    server: {
        type: 'node',
        entry_point: 'main.js',
        mcp_config: {
            command: 'node',
            args: ['${__dirname}/main.js'],
            env: {
                OPENLUXE_TOKEN: '${user_config.api_token}',
                OPENLUXE_API_URL: '${user_config.base_url}',
            },
        },
    },
    user_config: {
        api_token: {
            type: 'string',
            title: 'OpenLuxe API token',
            description: 'Create one at openluxe.co/developers/tokens — starts with ol_itk_',
            sensitive: true,
            required: true,
        },
        base_url: {
            type: 'string',
            title: 'API base URL',
            description: 'Leave the default unless you were told otherwise.',
            default: 'https://openluxe.co',
            required: false,
        },
    },
    compatibility: {
        platforms: ['darwin', 'win32', 'linux'],
        runtimes: { node: '>=18' },
    },
}, null, 2));

const target = join(out, `openluxe-${version}.mcpb`);
execSync(`npx --yes @anthropic-ai/mcpb pack "${stage}" "${target}"`, { stdio: 'inherit', cwd: root });
console.log(`\nBuilt ${target}`);
