import { InjectionToken } from '@angular/core';
import { ReuseTabCached, ReuseTitle } from '@ws/components/reuse-tab';

export const REUSE_TAB_CACHED_MANAGER = new InjectionToken<ReuseTabCachedManager>('REUSE_TAB_CACHED_MANAGER');

export interface ReuseTabCachedManager {
  list: ReuseTabCached[];
  title: { [url: string]: ReuseTitle };
  closeable: { [url: string]: boolean };
}

export class ReuseTabCachedManagerFactory implements ReuseTabCachedManager {
  list: ReuseTabCached[] = [];
  title: { [url: string]: ReuseTitle } = {};
  closeable: { [url: string]: boolean } = {};
}
