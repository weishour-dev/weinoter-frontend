import {
  ENVIRONMENT_INITIALIZER,
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  Provider,
} from '@angular/core';
import { RouteReuseStrategy } from '@angular/router';
import {
  REUSE_TAB_CACHED_MANAGER,
  REUSE_TAB_STORAGE_KEY,
  REUSE_TAB_STORAGE_STATE,
  ReuseTabCachedManagerFactory,
  ReuseTabLocalStorageState,
  ReuseTabMatchMode,
  ReuseTabRouteParamMatchMode,
  ReuseTabService,
  ReuseTabStrategy,
} from '@ws/components/reuse-tab';

export enum ReuseTabFeatureKind {
  CacheManager,
  LocalStorage,
}

export interface ReuseTabFeature<KindT extends ReuseTabFeatureKind> {
  ɵkind: KindT;
  ɵproviders: Provider[];
}

function makeFeature<KindT extends ReuseTabFeatureKind>(kind: KindT, providers: Provider[]): ReuseTabFeature<KindT> {
  return {
    ɵkind: kind,
    ɵproviders: providers,
  };
}

/**
 * 路由复用提供商
 */
export function provideReuseTab(options?: {
  /** 是否调试 (默认关闭) */
  debug?: boolean;
  /** 复用匹配模式 (默认菜单可复用) */
  mode?: ReuseTabMatchMode;
  /** 包含路由参数时匹配模式 (默认严格模式) */
  routeParamMatchMode?: ReuseTabRouteParamMatchMode;
  /** 排除规则，限 `mode=URL` */
  excludes?: RegExp[];
  /** 存储key */
  storeKey?: string;
  /** 缓存实体 */
  cacheManager?: ReuseTabFeature<ReuseTabFeatureKind.CacheManager>;
  /** LocalStorage实体 */
  localStorage?: ReuseTabFeature<ReuseTabFeatureKind.LocalStorage>;
}): EnvironmentProviders {
  const providers: Provider[] = [
    { provide: REUSE_TAB_STORAGE_KEY, useValue: options?.storeKey ?? 'ws-reuse-tab-state' },
    (options?.cacheManager ?? withCacheManager()).ɵproviders,
    (options?.localStorage ?? withLocalStorage()).ɵproviders,
    { provide: RouteReuseStrategy, useClass: ReuseTabStrategy, deps: [ReuseTabService] },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => {
        const reuseTabService = inject(ReuseTabService);
        if (options?.debug) reuseTabService.debug = options.debug;
        if (options?.mode) reuseTabService.mode = options.mode;
        if (options?.routeParamMatchMode) reuseTabService.routeParamMatchMode = options.routeParamMatchMode;
        if (options?.excludes) reuseTabService.excludes = options.excludes;
      },
    },
  ];

  return makeEnvironmentProviders(providers);
}

export function withCacheManager(): ReuseTabFeature<ReuseTabFeatureKind.CacheManager> {
  return makeFeature(ReuseTabFeatureKind.CacheManager, [
    {
      provide: REUSE_TAB_CACHED_MANAGER,
      useFactory: () => new ReuseTabCachedManagerFactory(),
    },
  ]);
}

export function withLocalStorage(): ReuseTabFeature<ReuseTabFeatureKind.LocalStorage> {
  return makeFeature(ReuseTabFeatureKind.LocalStorage, [
    {
      provide: REUSE_TAB_STORAGE_STATE,
      useFactory: () => new ReuseTabLocalStorageState(),
    },
  ]);
}
