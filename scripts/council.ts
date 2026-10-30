/**
 * pnpm council — runs both review roles in docs/review/ against `git diff main...HEAD`, one per model, read-only,
 * on the local CLIs' own subscription logins. Reports go to .local/council/<branch>-<short-sha>/<role>.md (gitignored).
 * A convenience, not a merge gate: nothing is committed or posted.
 */
import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export type ExecResult = { code: number | null; stdout: string; stderr: string; missing?: boolean };
export type Exec = (cmd: string, args: string[], opts: { cwd: string; stdin?: string }) => Promise<ExecResult>;

type Role = { name: string; cli: 'claude' | 'codex' };

/** Role specificity over model count: one model per role, alternating. */
const ROLES: Role[] = [
  { name: 'design-system', cli: 'claude' },
  { name: 'architecture', cli: 'codex' },
];

const LOGIN_HINT = { claude: 'run `claude` and log in', codex: 'run `codex login`' };

export function buildPrompt(roleText: string, diff: string): string {
  return `${roleText}\n\n## The diff (\`git diff main...HEAD\`)\n\n\`\`\`diff\n${diff}\n\`\`\`\n\nReport only: change nothing. Follow the role's report contract and reply with the report alone.\n`;
}

export function reportDir(branch: string, sha: string): string {
  return `.local/council/${branch.replaceAll('/', '-')}-${sha}`;
}

/** Runs one role; returns the report text, or an error message. Never writes a report for a failed run. */
async function runRole(role: Role, prompt: string, out: string, root: string, exec: Exec): Promise<{ report?: string; error?: string }> {
  const missing = `${role.name}: ${role.cli} not found on PATH. Install it, or perform the role by hand (docs/review/README.md).`;

  if (role.cli === 'claude') {
    // No MCP servers, skills or saved session: the role file has to stand alone, and the run stays small.
    const args = ['-p', '--output-format', 'json', '--tools', 'Read,Grep,Glob', '--strict-mcp-config', '--disable-slash-commands', '--no-session-persistence'];
    const res = await exec('claude', args, { cwd: root, stdin: prompt });
    if (res.missing) return { error: missing };
    let parsed: { is_error?: boolean; result?: string } = {};
    try {
      parsed = JSON.parse(res.stdout);
    } catch {}
    if (res.code !== 0 || parsed.is_error !== false || !parsed.result) {
      return { error: `${role.name}: claude failed (${(parsed.result ?? res.stderr).trim().slice(0, 200)}). If you're logged out, ${LOGIN_HINT.claude}.` };
    }
    return { report: parsed.result };
  }

  const status = await exec('codex', ['login', 'status'], { cwd: root });
  if (status.missing) return { error: missing };
  if (status.code !== 0) return { error: `${role.name}: codex is not logged in; ${LOGIN_HINT.codex}.` };
  const res = await exec('codex', ['exec', '-s', 'read-only', '-o', out, '-'], { cwd: root, stdin: prompt });
  let report = '';
  try {
    report = readFileSync(out, 'utf8');
  } catch {}
  rmSync(out, { force: true });
  if (res.code !== 0 || !report.trim()) {
    return { error: `${role.name}: codex failed (${res.stderr.trim().split('\n').at(-1)?.slice(0, 200) ?? 'no output'}).` };
  }
  return { report };
}

export async function runCouncil(opts: { root: string; branch: string; sha: string; diff: string; exec: Exec }): Promise<{ code: number; messages: string[] }> {
  const { root, branch, sha, diff, exec } = opts;
  if (branch === 'main' || branch === 'HEAD') {
    return { code: 1, messages: ['council: run it on a feature branch; it reviews `git diff main...HEAD`.'] };
  }
  if (!diff.trim()) {
    return { code: 1, messages: ['council: no committed changes against main to review.'] };
  }

  const dir = join(root, reportDir(branch, sha));
  mkdirSync(dir, { recursive: true });

  const results = await Promise.all(
    ROLES.map(async (role) => {
      const prompt = buildPrompt(readFileSync(join(root, 'docs/review', `${role.name}.md`), 'utf8'), diff);
      const path = join(dir, `${role.name}.md`);
      const { report, error } = await runRole(role, prompt, path, root, exec);
      if (error) return `✖ ${error}`;
      writeFileSync(path, report!);
      return `✓ ${role.name} (${role.cli}): ${join(reportDir(branch, sha), `${role.name}.md`)}`;
    }),
  );

  return { code: results.some((r) => r.startsWith('✖')) ? 1 : 0, messages: results };
}

/** The real CLI layer: spawns the command, feeds stdin, and reports a missing binary instead of throwing. */
const spawnExec: Exec = (cmd, args, { cwd, stdin }) =>
  new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('error', (err: NodeJS.ErrnoException) => resolve({ code: null, stdout, stderr: err.message, missing: err.code === 'ENOENT' }));
    child.on('close', (code) => resolve({ code, stdout, stderr }));
    child.stdin.end(stdin ?? '');
  });

if (import.meta.main) {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const git = (...args: string[]) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim();
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
  console.log(`council: reviewing ${branch} against main (committed changes only), both roles in parallel…`);
  const { code, messages } = await runCouncil({ root, branch, sha: git('rev-parse', '--short', 'HEAD'), diff: git('diff', 'main...HEAD'), exec: spawnExec });
  for (const m of messages) (m.startsWith('✖') ? console.error : console.log)(m);
  process.exit(code);
}
