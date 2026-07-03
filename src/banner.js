/**
 * The OpenLuxe splash — the diamond estate mark stacked above the wordmark,
 * washed in champagne gold. Shown at the top of `openluxe` / `openluxe help`.
 *
 * Responsive: picks a rendition that fits the terminal width (full ANSI-shadow
 * wordmark ≥ 72 cols, compact box-drawing wordmark ≥ 36, spaced letters below
 * that) so a thin pane never wraps the art into noise.
 *
 * Zero-dep: hand-set ASCII + 256-color ANSI. Color is applied only on an
 * interactive stdout without NO_COLOR, so piped output stays clean.
 */
import { VERSION } from './config.js';

// The mark: nested shield/gem outline (public/images/mark.svg) — apex, angled
// shoulders, vertical sides, chamfered flat base, hollow double-walled center.
const MARK = [
    '      ╱╲',
    '     ╱  ╲',
    '    ╱ ╱╲ ╲',
    '   ╱ ╱  ╲ ╲',
    '  ╱ ╱    ╲ ╲',
    ' ╱ ╱      ╲ ╲',
    '│ │        │ │',
    '│ │        │ │',
    '│ ╰────────╯ │',
    '╲            ╱',
    ' ╲──────────╱',
];

const MARK_SMALL = [
    '    ╱╲',
    '   ╱  ╲',
    '  ╱ ╱╲ ╲',
    ' ╱ ╱  ╲ ╲',
    '│ │    │ │',
    '│ ╰────╯ │',
    '╲        ╱',
    ' ╲──────╱',
];

// 68 cols — ANSI-shadow.
const WORDMARK = [
    ' ██████╗ ██████╗ ███████╗███╗   ██╗██╗     ██╗   ██╗██╗  ██╗███████╗',
    '██╔═══██╗██╔══██╗██╔════╝████╗  ██║██║     ██║   ██║╚██╗██╔╝██╔════╝',
    '██║   ██║██████╔╝█████╗  ██╔██╗ ██║██║     ██║   ██║ ╚███╔╝ █████╗  ',
    '██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║██║     ██║   ██║ ██╔██╗ ██╔══╝  ',
    '╚██████╔╝██║     ███████╗██║ ╚████║███████╗╚██████╔╝██╔╝ ██╗███████╗',
    ' ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝',
];

// 32 cols — compact box-drawing caps.
const WORDMARK_SMALL = [
    '╔═╗ ╔═╗ ╔═╗ ╔╗╔ ╦   ╦ ╦ ═╗ ╦ ╔═╗',
    '║ ║ ╠═╝ ║╣  ║║║ ║   ║ ║ ╔╩╦╝ ║╣ ',
    '╚═╝ ╩   ╚═╝ ╝╚╝ ╩═╝ ╚═╝ ╩ ╚═ ╚═╝',
];

// Champagne ramp, light → deep gold (xterm 256).
const RAMP = [230, 223, 222, 221, 220, 220, 178, 172];

function width(lines) {
    return Math.max(...lines.map((l) => l.length));
}

export function banner() {
    const cols = process.stdout.columns || 80;
    const on = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
    const dim = (s) => (on ? `\x1b[2m${s}\x1b[0m` : s);

    let mark, word, footer;
    if (cols >= 72) {
        mark = MARK;
        word = WORDMARK;
        footer = `v${VERSION}  ·  the platform, from your terminal  ·  openluxe.co/developers`;
    } else if (cols >= 36) {
        mark = MARK_SMALL;
        word = WORDMARK_SMALL;
        footer = `v${VERSION} · openluxe.co/developers`;
    } else {
        mark = MARK_SMALL;
        word = ['O P E N L U X E'];
        footer = `v${VERSION} · openluxe.co`;
    }

    // Center everything against the widest element that still fits the pane.
    // Blocks get ONE shared left margin (per-line centering would bend the
    // mark's diagonals, since its rows are pre-aligned to each other).
    const frame = Math.min(cols, Math.max(width(mark), width(word), footer.length));
    const center = (line) => ' '.repeat(Math.max(0, Math.floor((frame - line.length) / 2))) + line;
    const shade = (lines) => {
        const pad = ' '.repeat(Math.max(0, Math.floor((frame - width(lines)) / 2)));
        return lines.map((l, i) => {
            const color = RAMP[Math.min(RAMP.length - 1, Math.floor((i / lines.length) * RAMP.length))];
            return on ? `\x1b[38;5;${color}m${pad}${l}\x1b[0m` : pad + l;
        });
    };

    return ['', ...shade(mark), '', ...shade(word), '', dim(center(footer))].join('\n');
}
