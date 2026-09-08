import type { PageRecord, RouteEntry } from './types';

export type IndexLifecycle = 'INDEX' | 'HOLD_NOINDEX' | 'REDIRECT' | 'GONE';

export interface RouteIndexPolicy {
  lifecycle: IndexLifecycle;
  reason: string;
  ownerPath?: string;
}

export const INDEX: 'INDEX';
export const HOLD_NOINDEX: 'HOLD_NOINDEX';
export const REDIRECT: 'REDIRECT';
export const GONE: 'GONE';

export function normalizeIndexPath(input?: string): string;
export function getRouteIndexPolicy(routeOrPage: Partial<RouteEntry & PageRecord>): RouteIndexPolicy;
export function isIndexableRoute(routeOrPage: Partial<RouteEntry & PageRecord>): boolean;
export function isRoutableRoute(routeOrPage: Partial<RouteEntry & PageRecord>): boolean;
export function isEditorialIndexRoute(routeOrPage: Partial<RouteEntry & PageRecord>): boolean;
