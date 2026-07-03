import { load } from './config.js';

export class ApiError extends Error {
    constructor(status, detail, body) {
        super(detail || `HTTP ${status}`);
        this.status = status;
        this.body = body;
    }
}

/**
 * Node's fetch buries the real failure (TLS, DNS, refused) in `error.cause` and
 * reports only "fetch failed" — surface the cause plus an actionable hint.
 */
function networkErrorMessage(e, url) {
    const cause = e.cause || {};
    const code = cause.code || '';
    const causeMsg = cause.message || '';
    let origin = '';
    try { origin = ' (' + new URL(url).origin + ')'; } catch { /* keep plain */ }

    let msg = `Network error: ${causeMsg || e.message}${origin}`;
    if (/CERT|certificate|SSL|TLS/i.test(code + ' ' + causeMsg)) {
        msg += '\n  Untrusted/self-signed certificate — for a local dev server, retry with OPENLUXE_INSECURE=1'
            + '\n  (logging in with it set remembers the choice for that server)';
    } else if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') {
        msg += '\n  Host not found — check the API base (OPENLUXE_API_URL, or `openluxe auth status` for the stored base)';
    } else if (code === 'ECONNREFUSED') {
        msg += '\n  Connection refused — is the server running at that base URL?';
    }
    return msg;
}

/**
 * Perform an authenticated v1 API request. `path` is everything after
 * /api/v1 (e.g. "/contacts"). `query` is an object, `body` is JSON-able.
 */
export async function request(method, path, { query, body, token, base } = {}) {
    const cfg = load();
    const apiBase = base || cfg.base;
    const bearer = token || cfg.token;

    const url = new URL(apiBase.replace(/\/$/, '') + '/api/v1' + (path.startsWith('/') ? path : '/' + path));
    if (query) {
        for (const [k, v] of Object.entries(query)) {
            if (v !== undefined && v !== null) url.searchParams.set(k, v);
        }
    }

    const headers = { Accept: 'application/json' };
    if (bearer) headers.Authorization = `Bearer ${bearer}`;
    const init = { method, headers };
    if (body !== undefined && body !== null) {
        headers['Content-Type'] = 'application/json';
        init.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    let res;
    try {
        res = await fetch(url, init);
    } catch (e) {
        throw new ApiError(0, networkErrorMessage(e, url));
    }

    const text = await res.text();
    let parsed;
    try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }

    if (!res.ok) {
        const detail = parsed && typeof parsed === 'object'
            ? (parsed.detail || parsed.message || parsed.error || `HTTP ${res.status}`)
            : `HTTP ${res.status}`;
        throw new ApiError(res.status, detail, parsed);
    }
    return parsed;
}

/** Unauthenticated POST used only by the device-auth handshake. */
export async function postPublic(base, path, body) {
    const url = base.replace(/\/$/, '') + '/api/v1' + path;
    let res;
    try {
        res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(body || {}),
        });
    } catch (e) {
        throw new ApiError(0, networkErrorMessage(e, url));
    }
    const text = await res.text();
    let parsed;
    try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }
    return { ok: res.ok, status: res.status, data: parsed };
}
