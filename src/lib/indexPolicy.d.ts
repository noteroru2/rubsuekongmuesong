export type IndexLifecycle = 'INDEX' | 'HOLD_NOINDEX';
export interface IndexRouteLike {
  path?: string;
  pageType?: string;
}
export interface IndexPolicyResult {
  lifecycle: IndexLifecycle;
  reason: string;
}
export const INDEX: 'INDEX';
export const HOLD_NOINDEX: 'HOLD_NOINDEX';
export function normalizeIndexPath(input?: string): string;
export function getRouteIndexPolicy(routeOrPage: IndexRouteLike): IndexPolicyResult;
export function isIndexableRoute(routeOrPage: IndexRouteLike): boolean;
export function isEditorialIndexRoute(routeOrPage: IndexRouteLike): boolean;
