export interface LegacyRedirectEntry {
  source: string;
  destination: string;
}

export const LEGACY_REDIRECT_OWNERS: Map<string, string>;
export function getLegacyRedirectOwner(path: string): string | null;
export function getLegacyRedirectEntries(): LegacyRedirectEntry[];
export function buildAstroRedirects(): Record<string, { status: 301; destination: string }>;
