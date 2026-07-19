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

/** A per-area managed block in ~/.codex/AGENTS.md, keyed by slug. */
function writeCodexBlock(slug, body) {
    const dir = join(homedir(), '.codex');
    mkdirSync(dir, { recursive: true });
    const file = join(dir, 'AGENTS.md');
    const begin = `<!-- BEGIN OPENLUXE SKILL: ${slug} (managed by \`openluxe skill install\`) -->`;
    const end = `<!-- END OPENLUXE SKILL: ${slug} -->`;
    const block = `${begin}\n\n${body.trimEnd()}\n${end}`;
    let content = existsSync(file) ? readFileSync(file, 'utf8') : '';
    const s = content.indexOf(begin);
    const e = content.indexOf(end);
    if (s !== -1 && e !== -1) {
        content = content.slice(0, s) + block + content.slice(e + end.length);
    } else {
        content = (content ? content.trimEnd() + '\n\n' : '') + block + '\n';
    }
    writeFileSync(file, content);
    return file;
}

/**
 * Install ONE area operator skill (fetched from /skills/areas/<area>) to the
 * harness. Claude Code gets a self-contained SKILL.md with frontmatter under
 * skills/openluxe-<area>/; Codex gets a per-area managed block in AGENTS.md.
 *
 * @param {{area:string,title:string,summary:string,markdown:string}} data
 */
export function installAreaSkill(data, { project = false, codex = false } = {}) {
    const slug = `openluxe-${data.area}`;
    const body = data.markdown || '';
    if (codex) return writeCodexBlock(slug, body);

    const description = (data.summary || '').replace(/\s+/g, ' ').trim();
    const md = `---\nname: OpenLuxe ${data.title || data.area}\ndescription: ${description}\n---\n\n${body}\n`;
    const root = project ? join(process.cwd(), '.claude') : join(homedir(), '.claude');
    const dir = join(root, 'skills', slug);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, 'SKILL.md');
    writeFileSync(file, md);
    return file;
}
