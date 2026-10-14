/**
 * WCAG 2.2 AA contrast pairs, derived from the resolved token naming convention
 * so a new surface role or foreground is covered without editing this file.
 *
 *   surface.<role>.bg            the background
 *   surface.<role>.<fg>          every sibling is text on that bg: 4.5:1
 *   surface.<role>.border        excluded: borders are decorative; no component relies on one to be identified
 *   surface.<role>.focus         focus indicator on that bg: 3:1 (SC 1.4.11). Falls back to the global focus.ring
 *
 * No role is designated large-text (3:1) yet. If one is, add its foreground name to LARGE_TEXT.
 */
import Color from 'colorjs.io';

export type ResolvedTokens = Record<string, { $type: string; $value: unknown; aliasOf?: string }>;

export const AA_TEXT = 4.5;
export const AA_LARGE_TEXT = 3;
export const AA_NON_TEXT = 3;

const DECORATIVE = new Set(['border']);
const LARGE_TEXT = new Set<string>();

export interface Pair {
  fg: string;
  bg: string;
  ratio: number;
  min: number;
}

const hex = (tokens: ResolvedTokens, id: string): string => {
  const value = tokens[id]?.$value as { hex?: string } | undefined;
  if (!value?.hex) throw new Error(`${id} is not a resolved color with a hex value`);
  return value.hex;
};

/** Every pair the convention implies, plus structural errors (a role with no bg, or a bg with no text). */
export function contrastPairs(tokens: ResolvedTokens): { pairs: Pair[]; errors: string[] } {
  const roles = new Map<string, Set<string>>();
  for (const id of Object.keys(tokens)) {
    const [group, role, fg, ...rest] = id.split('.');
    if (group !== 'surface' || !role || !fg || rest.length) continue;
    if (!roles.has(role)) roles.set(role, new Set());
    roles.get(role)!.add(fg);
  }

  const pairs: Pair[] = [];
  const errors: string[] = [];
  const pair = (fg: string, bg: string, min: number) =>
    pairs.push({ fg, bg, min, ratio: Color.contrastWCAG21(hex(tokens, fg), hex(tokens, bg)) });

  for (const [role, fgs] of roles) {
    const bg = `surface.${role}.bg`;
    if (!fgs.has('bg')) {
      errors.push(`surface.${role} has foregrounds but no bg`);
      continue;
    }
    if (!fgs.has('text')) errors.push(`surface.${role} has a bg but no text foreground`);
    for (const fg of fgs) {
      if (fg === 'bg' || DECORATIVE.has(fg)) continue;
      if (fg === 'focus') pair(`surface.${role}.focus`, bg, AA_NON_TEXT);
      else pair(`surface.${role}.${fg}`, bg, LARGE_TEXT.has(fg) ? AA_LARGE_TEXT : AA_TEXT);
    }
    if (!fgs.has('focus')) {
      if (tokens['focus.ring']) pair('focus.ring', bg, AA_NON_TEXT);
      else errors.push(`surface.${role} has no focus foreground and there is no global focus.ring`);
    }
  }
  if (roles.size === 0) errors.push('no surface.<role>.bg tokens found');
  return { pairs, errors };
}
