import { describe, expect, it } from 'vitest';
import { AA_NON_TEXT, AA_TEXT, contrastPairs, type ResolvedTokens } from './contrast.ts';

const color = (hex: string) => ({ $type: 'color', $value: { hex } });

const base: ResolvedTokens = {
  'focus.ring': color('#0055cc'),
  'surface.default.bg': color('#ffffff'),
  'surface.default.text': color('#111111'),
  'surface.default.text-muted': color('#666666'),
  'surface.default.border': color('#eeeeee'),
};

describe('contrastPairs', () => {
  it('pairs every non-decorative foreground with its bg, and the focus ring at 3:1', () => {
    const { pairs, errors } = contrastPairs(base);
    expect(errors).toEqual([]);
    expect(pairs.map((p) => [p.fg, p.min])).toEqual([
      ['surface.default.text', AA_TEXT],
      ['surface.default.text-muted', AA_TEXT],
      ['focus.ring', AA_NON_TEXT],
    ]);
    expect(pairs[0]!.ratio).toBeCloseTo(18.88, 1);
  });

  it('covers a new role and foreground with no code change', () => {
    const { pairs } = contrastPairs({ ...base, 'surface.new.bg': color('#000000'), 'surface.new.caption': color('#888888') });
    expect(pairs.map((p) => p.fg)).toContain('surface.new.caption');
  });

  it('prefers a role-specific focus foreground over the global ring', () => {
    const { pairs } = contrastPairs({ ...base, 'surface.default.focus': color('#000000') });
    expect(pairs.map((p) => p.fg)).toContain('surface.default.focus');
    expect(pairs.map((p) => p.fg)).not.toContain('focus.ring');
  });

  it('reports a bg with no text and foregrounds with no bg', () => {
    const { errors } = contrastPairs({ ...base, 'surface.empty.bg': color('#000000'), 'surface.orphan.text': color('#000000') });
    expect(errors).toEqual(['surface.empty has a bg but no text foreground', 'surface.orphan has foregrounds but no bg']);
  });
});
