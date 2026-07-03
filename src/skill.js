/**
 * `openluxe skill` — ship the OpenLuxe agent skill to wherever the user's AI
 * agent reads its instructions from.
 *
 * The canonical SKILL.md lives in this package (plugins/openluxe/skills/
 * openluxe/SKILL.md — the same file the Claude Code plugin exposes), so the
 * installed skill always matches the CLI version it shipped with.
 *
 * Targets:
 *   claude (default)  ~/.claude/skills/openluxe/SKILL.md   (personal skill)
 *   --project         ./.claude/skills/openluxe/SKILL.md   (repo-local skill)
 *   --codex           ~/.codex/AGENTS.md                    (marked block, idempotent)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const CANONICAL = new URL('../plugins/openluxe/skills/openluxe/SKILL.md', import.meta.url);

const CODEX_BEGIN = '<!-- BEGIN OPENLUXE SKILL (managed by `openluxe skill install --codex`) -->';
const CODEX_END = '<!-- END OPENLUXE SKILL -->';

export function skillText() {
    return readFileSync(CANONICAL, 'utf8');
}

/** Strip the YAML frontmatter for hosts that don't use it (Codex AGENTS.md). */
function bodyOnly(md) {
    return md.replace(/^---\n[\s\S]*?\n---\n/, '').trimStart();
}

function installClaude({ project = false } = {}) {
    const root = project ? join(process.cwd(), '.claude') : join(homedir(), '.claude');
    const dir = join(root, 'skills', 'openluxe');
    mkdirSync(dir, { recursive: true });
    const file = join(dir, 'SKILL.md');
    writeFileSync(file, skillText());
    return file;
}

function installCodex() {
    const dir = join(homedir(), '.codex');
    mkdirSync(dir, { recursive: true });
    const file = join(dir, 'AGENTS.md');
    const block = `${CODEX_BEGIN}\n\n${bodyOnly(skillText())}\n${CODEX_END}`;

    let content = existsSync(file) ? readFileSync(file, 'utf8') : '';
    const start = content.indexOf(CODEX_BEGIN);
    const end = content.indexOf(CODEX_END);
    if (start !== -1 && end !== -1) {
        // Replace the managed block in place — never touch anything else.
        content = content.slice(0, start) + block + content.slice(end + CODEX_END.length);
    } else {
        content = (content ? content.trimEnd() + '\n\n' : '') + block + '\n';
    }
    writeFileSync(file, content);
    return file;
}

export function install({ project = false, codex = false } = {}) {
    return codex ? installCodex() : installClaude({ project });
}
