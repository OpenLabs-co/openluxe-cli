/**
 * The OpenLuxe splash — the estate gem mark stacked above the wordmark, washed
 * in champagne gold. Shown at the top of `openluxe` / `openluxe help`.
 *
 * The mark is TYPOGRAPHIC: a field of the repeating word "openluxe" with the
 * pointed-top pentagon gem (public/images/mark.svg, logo-exclusion.png) picked
 * out of it — the thick wall band lit in gold, the hollow center dimmed — so
 * the brand name literally forms the brand mark.
 *
 * Responsive: picks a rendition that fits the terminal width (full ANSI-shadow
 * wordmark ≥ 72 cols, compact box-drawing wordmark ≥ 36, spaced letters below
 * that) so a thin pane never wraps the art into noise.
 *
 * Zero-dep: generated glyphs + 256-color ANSI. Color is applied only on an
 * interactive stdout without NO_COLOR, so piped output stays clean.
 */
import { VERSION } from './config.js';

const TEXT = 'openluxe';

// Per-row [leftCol, rightCol] of a FILLED pointed-top pentagon: apex peak →
// diagonal shoulders (grow rows) → vertical sides (side) → chamfered bottom
// corners → flat base (cham rows). `S` is the horizontal step per row — S=2
// makes the diagonals shallow so the shape reads ~square despite terminal
// cells being ~2:1 (a 1-col/row diagonal would render tall and narrow).
function pent(grow, side, cham, S) {
    const raw = [];
    for (let r = 0; r < grow; r++) raw.push([-S * r, 1 + S * r]);
    const sl = -S * (grow - 1), sr = 1 + S * (grow - 1);
    for (let s = 0; s < side; s++) raw.push([sl, sr]);
    for (let j = 1; j <= cham; j++) raw.push([sl + S * j, sr - S * j]);
    const off = 1 - Math.min(...raw.map((x) => x[0]));
    const rows = raw.map(([l, r]) => [l + off, r + off]);
    return { rows, width: Math.max(...rows.map((x) => x[1])) + 2 };
}

// Fill the pentagon with the repeating word and classify every cell: 'B' = the
// thick wall band (→ gold), 'c' = the hollow center (→ dim), ' ' = outside.
// The hollow is the shape eroded by the border (bh cols wide, bv rows tall).
function buildGem({ grow, side, cham, S, bh, bv }) {
    const { rows, width } = pent(grow, side, cham, S);
    const R = rows.length;
    const inside = (r, c) => r >= 0 && r < R && c >= rows[r][0] && c <= rows[r][1];
    const hollow = (r, c) => inside(r, c)
        && inside(r, c - bh) && inside(r, c + bh)
        && inside(r - bv, c) && inside(r + bv, c);
    const lines = [];
    const zones = [];
    let k = 0;
    for (let r = 0; r < R; r++) {
        let ln = '';
        let zn = '';
        for (let c = 0; c < width; c++) {
            if (!inside(r, c)) {
                ln += ' ';
                zn += ' ';
                continue;
            }
            zn += hollow(r, c) ? 'c' : 'B';
            ln += TEXT[k++ % TEXT.length];
        }
        lines.push(ln);
        zones.push(zn);
    }
    return { lines, zones, width };
}

const GEM = buildGem({ grow: 7, side: 2, cham: 3, S: 2, bh: 4, bv: 2 });
const GEM_SMALL = buildGem({ grow: 5, side: 1, cham: 2, S: 2, bh: 3, bv: 1 });

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
const DIM_GOLD = 240; // muted grey-gold for the un-highlighted fill letters

function width(lines) {
    return Math.max(...lines.map((l) => l.length));
}

export function banner() {
    const cols = process.stdout.columns || 80;
    const on = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
    const dim = (s) => (on ? `\x1b[2m${s}\x1b[0m` : s);

    let gem, word, footer;
    if (cols >= 72) {
        gem = GEM;
        word = WORDMARK;
        footer = `v${VERSION}  ·  the platform, from your terminal  ·  openluxe.co/developers`;
    } else if (cols >= 36) {
        gem = GEM_SMALL;
        word = WORDMARK_SMALL;
        footer = `v${VERSION} · openluxe.co/developers`;
    } else {
        gem = GEM_SMALL;
        word = ['O P E N L U X E'];
        footer = `v${VERSION} · openluxe.co`;
    }

    // Center every block against the widest element that still fits the pane.
    const frame = Math.min(cols, Math.max(gem.width, width(word), footer.length));
    const center = (line) => ' '.repeat(Math.max(0, Math.floor((frame - line.length) / 2))) + line;

    // The wordmark: one gold per row, top-light → bottom-deep (shared margin so
    // the block's alignment never bends).
    const shadeWord = (lines) => {
        const pad = ' '.repeat(Math.max(0, Math.floor((frame - width(lines)) / 2)));
        return lines.map((l, i) => {
            const color = RAMP[Math.min(RAMP.length - 1, Math.floor((i / lines.length) * RAMP.length))];
            return on ? `\x1b[38;5;${color}m${pad}${l}\x1b[0m` : pad + l;
        });
    };

    // The gem: per-CELL — band letters glow gold (gradient by row), hollow
    // letters stay a muted fill. Trailing outside-cells are trimmed so the
    // block never carries stray spaces.
    const paintGem = (g) => {
        const pad = ' '.repeat(Math.max(0, Math.floor((frame - g.width) / 2)));
        return g.lines.map((line, r) => {
            if (!on) return (pad + line).replace(/\s+$/, '');
            const gold = RAMP[Math.min(RAMP.length - 1, Math.floor((r / g.lines.length) * RAMP.length))];
            let outp = pad;
            for (let c = 0; c < line.length; c++) {
                const ch = line[c];
                if (ch === ' ') {
                    outp += ' ';
                    continue;
                }
                const color = g.zones[r][c] === 'B' ? `\x1b[1;38;5;${gold}m` : `\x1b[38;5;${DIM_GOLD}m`;
                outp += `${color}${ch}\x1b[0m`;
            }
            return outp.replace(/\s+$/, '');
        });
    };

    return ['', ...paintGem(gem), '', ...shadeWord(word), '', dim(center(footer))].join('\n');
}
