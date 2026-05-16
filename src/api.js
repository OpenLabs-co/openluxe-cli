import { load } from './config.js';

export class ApiError extends Error {
    constructor(status, detail, body) {
        super(detail || `HTTP ${status}`);
        this.status = status;
        this.body = body;
    }
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
        throw new ApiError(0, `Network error: ${e.message}`);
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
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body || {}),
    });
    const text = await res.text();
    let parsed;
    try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }
    return { ok: res.ok, status: res.status, data: parsed };
}
