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

/** Writes the role's report to `path` and returns no error, or returns the error and leaves no report. */
async function runRole(role: Role, prompt: string, path: string, root: string, exec: Exec): Promise<string | undefined> {
  const missing = `${role.name}: ${role.cli} not found on PATH. Install it, or perform the role by hand (docs/review/README.md).`;

  if (role.cli === 'claude') {
    // No MCP servers, skills or saved session: the role file has to stand alone, and the run stays small.
    const args = ['-p', '--output-format', 'json', '--tools', 'Read,Grep,Glob', '--strict-mcp-config', '--disable-slash-commands', '--no-session-persistence'];
    const res = await exec('claude', args, { cwd: root, stdin: prompt });
    if (res.missing) return missing;
    let parsed: { is_error?: boolean; result?: string } = {};
    try {
      parsed = JSON.parse(res.stdout);
    } catch {}
    if (res.code !== 0 || parsed.is_error !== false || !parsed.result) {
      return `${role.name}: claude failed (${(parsed.result ?? res.stderr).trim().slice(0, 200)}). If you're logged out, ${LOGIN_HINT.claude}.`;
    }
    writeFileSync(path, parsed.result);
    return;
  }

  const status = await exec('codex', ['login', 'status'], { cwd: root });
  if (status.missing) return missing;
  if (status.code !== 0) return `${role.name}: codex is not logged in; ${LOGIN_HINT.codex}.`;
  const res = await exec('codex', ['exec', '-s', 'read-only', '-o', path, '-'], { cwd: root, stdin: prompt });
  let report = '';
  try {
    report = readFileSync(path, 'utf8');
  } catch {}
  if (res.code !== 0 || !report.trim()) {
    rmSync(path, { force: true });
    return `${role.name}: codex failed (${res.stderr.trim().split('\n').at(-1)?.slice(0, 200) ?? 'no output'}).`;
  }
}

export async function runCouncil(opts: { root: string; branch: string; sha: string; diff: string; exec: Exec }): Promise<{ code: number; messages: string[] }> {
  const { root, branch, sha, diff, exec } = opts;
  if (branch === 'main' || branch === 'HEAD') {
    return { code: 1, messages: ['council: run it on a feature branch; it reviews `git diff main...HEAD`.'] };
  }
  if (!diff.trim()) {
    return { code: 1, messages: ['council: no committed changes against main to review.'] };
  }

  const rel = reportDir(branch, sha);
  mkdirSync(join(root, rel), { recursive: true });

  const results = await Promise.all(
    ROLES.map(async (role) => {
      const file = join(rel, `${role.name}.md`);
      const prompt = buildPrompt(readFileSync(join(root, 'docs/review', `${role.name}.md`), 'utf8'), diff);
      rmSync(join(root, file), { force: true }); // a rerun at the same sha must not leave the last report behind
      const error = await runRole(role, prompt, join(root, file), root, exec);
      return error ? { ok: false, message: `✖ ${error}` } : { ok: true, message: `✓ ${role.name} (${role.cli}): ${file}` };
    }),
  );

  return { code: results.every((r) => r.ok) ? 0 : 1, messages: results.map((r) => r.message) };
}

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
  (code ? console.error : console.log)(messages.join('\n'));
  process.exit(code);
}
