import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildPrompt, reportDir, runCouncil, type Exec } from './council.ts';

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'council-'));
  mkdirSync(join(root, 'docs/review'), { recursive: true });
  writeFileSync(join(root, 'docs/review/design-system.md'), '# Design System role');
  writeFileSync(join(root, 'docs/review/architecture.md'), '# Architecture role');
});

const DIFF = 'diff --git a/x b/x\n+changed';

/** A fake CLI layer: answers like logged-in claude and codex unless a test overrides a command. */
function fakeExec(overrides: Record<string, Awaited<ReturnType<Exec>>> = {}) {
  const calls: string[] = [];
  const exec: Exec = async (cmd, args) => {
    const key = [cmd, ...args.slice(0, 2)].join(' ');
    calls.push(key);
    const override = overrides[key] ?? overrides[cmd];
    if (override) return override;
    if (cmd === 'claude') return { code: 0, stdout: JSON.stringify({ is_error: false, result: 'claude findings' }), stderr: '' };
    if (key === 'codex login status') return { code: 0, stdout: 'Logged in', stderr: '' };
    writeFileSync(args[args.indexOf('-o') + 1]!, 'codex findings');
    return { code: 0, stdout: '', stderr: '' };
  };
  return { exec, calls };
}

describe('buildPrompt', () => {
  it('puts the role file first, then the diff, with the report-only instruction', () => {
    const prompt = buildPrompt('# Role text', DIFF);
    expect(prompt.indexOf('# Role text')).toBe(0);
    expect(prompt.indexOf(DIFF)).toBeGreaterThan(prompt.indexOf('# Role text'));
    expect(prompt).toMatch(/report only/i);
    expect(prompt).toMatch(/change nothing/i);
  });
});

describe('reportDir', () => {
  it('flattens the branch name and appends the short sha', () => {
    expect(reportDir('feat/x', 'abc1234')).toBe('.local/council/feat-x-abc1234');
  });
});

describe('runCouncil', () => {
  it('writes one report per role on a feature branch', async () => {
    const { exec } = fakeExec();
    const { code } = await runCouncil({ root, branch: 'feat/x', sha: 'abc1234', diff: DIFF, exec });
    expect(code).toBe(0);
    const dir = join(root, '.local/council/feat-x-abc1234');
    expect(readFileSync(join(dir, 'design-system.md'), 'utf8')).toBe('claude findings');
    expect(readFileSync(join(dir, 'architecture.md'), 'utf8')).toBe('codex findings');
  });

  it.each([
    ['on main', 'main', DIFF],
    ['with an empty diff', 'feat/x', '  \n'],
  ])('exits non-zero and runs no CLI %s', async (_, branch, diff) => {
    const { exec, calls } = fakeExec();
    const { code, messages } = await runCouncil({ root, branch, sha: 'abc1234', diff, exec });
    expect(code).toBe(1);
    expect(messages.join('\n')).not.toBe('');
    expect(calls).toEqual([]);
  });

  it('fails only the role whose CLI is not on PATH, with an install hint', async () => {
    const { exec } = fakeExec({ claude: { code: null, stdout: '', stderr: '', missing: true } });
    const { code, messages } = await runCouncil({ root, branch: 'feat/x', sha: 'abc1234', diff: DIFF, exec });
    expect(code).toBe(1);
    expect(messages.join('\n')).toMatch(/design-system.*claude.*not found/i);
    const dir = join(root, '.local/council/feat-x-abc1234');
    expect(existsSync(join(dir, 'design-system.md'))).toBe(false);
    expect(existsSync(join(dir, 'architecture.md'))).toBe(true);
  });

  it('treats a Claude is_error result as a login failure and writes no report', async () => {
    const { exec } = fakeExec({ claude: { code: 1, stdout: JSON.stringify({ is_error: true, result: 'Not logged in' }), stderr: '' } });
    const { code, messages } = await runCouncil({ root, branch: 'feat/x', sha: 'abc1234', diff: DIFF, exec });
    expect(code).toBe(1);
    expect(messages.join('\n')).toMatch(/design-system.*log in/i);
    expect(existsSync(join(root, '.local/council/feat-x-abc1234/design-system.md'))).toBe(false);
  });

  it('checks codex login first and never runs the review when it fails', async () => {
    const { exec, calls } = fakeExec({ 'codex login status': { code: 1, stdout: '', stderr: 'Not logged in' } });
    const { code, messages } = await runCouncil({ root, branch: 'feat/x', sha: 'abc1234', diff: DIFF, exec });
    expect(code).toBe(1);
    expect(messages.join('\n')).toMatch(/architecture.*codex login/i);
    expect(calls).not.toContain('codex exec -s');
    expect(existsSync(join(root, '.local/council/feat-x-abc1234/architecture.md'))).toBe(false);
  });

  it('removes the previous report when a rerun of that role fails', async () => {
    const dir = join(root, '.local/council/feat-x-abc1234');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'design-system.md'), 'old findings');
    const { exec } = fakeExec({ claude: { code: 1, stdout: JSON.stringify({ is_error: true, result: 'Not logged in' }), stderr: '' } });
    await runCouncil({ root, branch: 'feat/x', sha: 'abc1234', diff: DIFF, exec });
    expect(existsSync(join(dir, 'design-system.md'))).toBe(false);
  });
});
