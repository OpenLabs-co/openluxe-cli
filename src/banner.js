/**
 * The OpenLuxe splash — the diamond estate mark stacked above the wordmark,
 * washed in champagne gold. Shown at the top of `openluxe` / `openluxe help`.
 *
 * Zero-dep: hand-set ASCII + 256-color ANSI. Color is applied only on an
 * interactive stdout without NO_COLOR, so piped output stays clean.
 */
import { VERSION } from './config.js';

// The mark: nested shield/gem outline (public/images/mark.svg) — apex, angled
// shoulders, vertical sides, chamfered flat base, hollow double-walled center.
const MARK = [
    '            ╱╲',
    '           ╱  ╲',
    '          ╱ ╱╲ ╲',
    '         ╱ ╱  ╲ ╲',
    '        ╱ ╱    ╲ ╲',
    '       ╱ ╱      ╲ ╲',
    '      │ │        │ │',
    '      │ │        │ │',
    '      │ ╰────────╯ │',
    '      ╲            ╱',
    '       ╲──────────╱',
];

const WORDMARK = [
    ' ██████╗ ██████╗ ███████╗███╗   ██╗██╗     ██╗   ██╗██╗  ██╗███████╗',
    '██╔═══██╗██╔══██╗██╔════╝████╗  ██║██║     ██║   ██║╚██╗██╔╝██╔════╝',
    '██║   ██║██████╔╝█████╗  ██╔██╗ ██║██║     ██║   ██║ ╚███╔╝ █████╗  ',
    '██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║██║     ██║   ██║ ██╔██╗ ██╔══╝  ',
    '╚██████╔╝██║     ███████╗██║ ╚████║███████╗╚██████╔╝██╔╝ ██╗███████╗',
    ' ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝',
];

const WIDTH = 68; // wordmark width — everything centers against it

// Champagne ramp, light → deep gold (xterm 256).
const MARK_RAMP = [230, 230, 223, 223, 222, 221, 220, 220, 178, 178, 172];
const WORD_RAMP = [223, 222, 220, 220, 178, 172];

function paint(line, color, on) {
    return on ? `\x1b[38;5;${color}m${line}\x1b[0m` : line;
}

function center(line, width = WIDTH) {
    const pad = Math.max(0, Math.floor((width - line.length) / 2));
    return ' '.repeat(pad) + line;
}

export function banner() {
    const on = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
    const dim = (s) => (on ? `\x1b[2m${s}\x1b[0m` : s);

    const markPad = ' '.repeat(Math.floor((WIDTH - 20) / 2) - 2);
    const lines = [
        '',
        ...MARK.map((l, i) => markPad + paint(l, MARK_RAMP[i], on)),
        '',
        ...WORDMARK.map((l, i) => paint(l, WORD_RAMP[i], on)),
        '',
        center(`v${VERSION}  ·  the platform, from your terminal  ·  openluxe.co/developers`).replace(
            /^(\s*)(.*)$/,
            (_, s, t) => s + dim(t),
        ),
        '',
    ];
    return lines.join('\n');
}
