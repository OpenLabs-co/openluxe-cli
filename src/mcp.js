/**
 * `openluxe mcp` — a zero-dependency MCP (Model Context Protocol) server over
 * stdio that exposes the OpenLuxe v1 API to local AI clients (Claude Code,
 * Cursor, etc.). It authenticates with the token stored by `openluxe auth login`
 * and proxies every call to https://<base>/api/v1, so an agent gets the same
 * scoped, ToS-gated, billed surface a human gets from the CLI.
 *
 * Transport: newline-delimited JSON-RPC 2.0 on stdin/stdout (the MCP stdio
 * transport). We implement just enough of the protocol — initialize, tools/list,
 * tools/call, ping — to be a useful client target.
 *
 * Tools are intentionally lean (a generic passthrough + endpoint discovery +
 * a few high-value typed tools) rather than one-per-endpoint, so the agent's
 * tool list stays small; `openluxe_api_request` covers the full ~300-endpoint
 * surface. This mirrors the hosted /api/v1/mcp server.
 */
import { createInterface } from 'node:readline';
import { request, ApiError } from './api.js';
import { RESOURCES } from './resources.js';
import { load, VERSION } from './config.js';

const PROTOCOL_VERSION = '2025-06-18';

function send(msg) {
    process.stdout.write(JSON.stringify(msg) + '\n');
}

function result(id, result) {
    send({ jsonrpc: '2.0', id, result });
}

function error(id, code, message) {
    send({ jsonrpc: '2.0', id, error: { code, message } });
}

/** A flat catalog of every typed CLI command, for the discovery tool. */
function endpointCatalog() {
    const rows = [];
    for (const [resource, def] of Object.entries(RESOURCES)) {
        for (const [command, spec] of Object.entries(def.commands)) {
            rows.push({ resource, command, method: spec.method, path: spec.path, summary: spec.summary || null });
        }
    }
    return rows;
}

const TOOLS = [
    {
        name: 'openluxe_api_request',
        description:
            'Call any OpenLuxe v1 API endpoint. Use openluxe_list_endpoints first to discover paths. '
            + 'GET/DELETE use `query`; POST/PATCH/PUT use `body`. Paths are relative to /api/v1 (e.g. "/contacts").',
        inputSchema: {
            type: 'object',
            properties: {
                method: { type: 'string', enum: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'], description: 'HTTP method' },
                path: { type: 'string', description: 'Path after /api/v1, e.g. /contacts or /contacts/42' },
                query: { type: 'object', description: 'Query parameters (GET/DELETE)', additionalProperties: true },
                body: { type: 'object', description: 'JSON body (POST/PATCH/PUT)', additionalProperties: true },
            },
            required: ['method', 'path'],
        },
        run: (args) => request(args.method, args.path, { query: args.query, body: args.body }),
    },
    {
        name: 'openluxe_list_endpoints',
        description: 'List every available OpenLuxe v1 endpoint (method, path, summary) grouped by resource, so you know what to pass to openluxe_api_request.',
        inputSchema: {
            type: 'object',
            properties: { resource: { type: 'string', description: 'Optional: filter to one resource (e.g. "contacts")' } },
        },
        run: async (args) => {
            const rows = endpointCatalog();
            return args?.resource ? rows.filter((r) => r.resource === args.resource) : rows;
        },
    },
    {
        name: 'openluxe_me',
        description: 'Show the authenticated user and the abilities (scopes) of the presenting token.',
        inputSchema: { type: 'object', properties: {} },
        run: () => request('GET', '/me'),
    },
    {
        name: 'openluxe_search',
        description: 'Universal search across the user\'s OpenLuxe records (contacts, listings, deals, etc.).',
        inputSchema: { type: 'object', properties: { q: { type: 'string', description: 'Search query' } }, required: ['q'] },
        run: (args) => request('GET', '/search', { query: { q: args.q } }),
    },
    {
        name: 'openluxe_contacts_list',
        description: 'List the user\'s CRM contacts. Optional filters: industry, email, phone, search, updated_since, created_via, per_page.',
        inputSchema: { type: 'object', properties: { search: { type: 'string' }, industry: { type: 'string' }, per_page: { type: 'number' } } },
        run: (args) => request('GET', '/contacts', { query: args || {} }),
    },
    {
        name: 'openluxe_create_contact',
        description: 'Create a CRM contact. Fields: email, first_name, last_name, phone, company, position, industry, etc.',
        inputSchema: {
            type: 'object',
            properties: {
                first_name: { type: 'string' }, last_name: { type: 'string' }, email: { type: 'string' },
                phone: { type: 'string' }, company: { type: 'string' }, industry: { type: 'string' },
            },
        },
        run: (args) => request('POST', '/contacts', { body: args || {} }),
    },
    {
        name: 'openluxe_credits_balance',
        description: 'Show the user\'s credit balance (what API generation calls are billed against).',
        inputSchema: { type: 'object', properties: {} },
        run: () => request('GET', '/credits/balance'),
    },
];

const TOOL_INDEX = Object.fromEntries(TOOLS.map((t) => [t.name, t]));

async function handle(msg) {
    const { id, method, params } = msg;
    const isRequest = id !== undefined && id !== null;

    switch (method) {
        case 'initialize':
            return result(id, {
                protocolVersion: PROTOCOL_VERSION,
                capabilities: { tools: {} },
                serverInfo: { name: 'openluxe', version: VERSION },
                instructions: 'Drive the OpenLuxe v1 API (CRM, listings, business, generation, …). '
                    + 'Start with openluxe_list_endpoints, then openluxe_api_request for anything not covered by a typed tool.',
            });

        case 'notifications/initialized':
        case 'notifications/cancelled':
            return; // notifications get no response

        case 'ping':
            return isRequest && result(id, {});

        case 'tools/list':
            return result(id, {
                tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
            });

        case 'tools/call': {
            const tool = TOOL_INDEX[params?.name];
            if (!tool) return error(id, -32602, `Unknown tool: ${params?.name}`);
            try {
                const data = await tool.run(params.arguments || {});
                return result(id, { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] });
            } catch (e) {
                // Surface API errors to the model as tool errors (isError), not protocol errors.
                const text = e instanceof ApiError
                    ? `API error ${e.status}: ${e.message}\n${JSON.stringify(e.body ?? {}, null, 2)}`
                    : `Error: ${e.message}`;
                return result(id, { content: [{ type: 'text', text }], isError: true });
            }
        }

        default:
            return isRequest && error(id, -32601, `Method not found: ${method}`);
    }
}

export async function serve() {
    const { token, base } = load();
    if (!token) {
        process.stderr.write('openluxe mcp: not signed in — run `openluxe auth login` first.\n');
        process.exit(1);
    }
    process.stderr.write(`openluxe mcp server ready (${base}) — ${TOOLS.length} tools.\n`);

    const rl = createInterface({ input: process.stdin });
    for await (const line of rl) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        let msg;
        try {
            msg = JSON.parse(trimmed);
        } catch {
            error(null, -32700, 'Parse error');
            continue;
        }
        try {
            await handle(msg);
        } catch (e) {
            if (msg?.id !== undefined && msg?.id !== null) error(msg.id, -32603, `Internal error: ${e.message}`);
        }
    }
}
