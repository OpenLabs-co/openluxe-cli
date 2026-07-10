import { spawn } from 'node:child_process';

/** Best-effort launch of the user's default browser; the printed URL is the fallback. */
export function openBrowser(url) {
    const cmd = process.platform === 'darwin' ? 'open'
        : process.platform === 'win32' ? 'cmd' : 'xdg-open';
    const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
    try {
        const child = spawn(cmd, args, { stdio: 'ignore', detached: true });
        child.on('error', () => {});
        child.unref();
    } catch { /* headless / no browser */ }
}
