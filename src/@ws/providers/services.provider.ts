import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ENVIRONMENT_INITIALIZER, EnvironmentProviders, inject, Provider } from '@angular/core';
import {
  WsColorService,
  WsLoadingInterceptor,
  WsLoadingService,
  WsMediaWatcherService,
  WsMessageService,
  WsPlatformService,
  WsSplashScreenService,
  WsUtilsService,
} from '@ws/services';

/**
 * 服务提供商
 */
export const provideServices = (): Array<Provider | EnvironmentProviders> => {
  return [
    // 加载提供商
    provideHttpClient(withInterceptors([WsLoadingInterceptor])),
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => inject(WsLoadingService),
      multi: true,
    },
    // 媒体观察器提供商
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => inject(WsMediaWatcherService),
      multi: true,
    },
    // 平台提供商
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => inject(WsPlatformService),
      multi: true,
    },
    // 闪屏提供商
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => inject(WsSplashScreenService),
      multi: true,
    },
    // 工具提供商
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => inject(WsUtilsService),
      multi: true,
    },
    // 颜色提供商
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => inject(WsColorService),
      multi: true,
    },
    // 消息提供商
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => inject(WsMessageService),
      multi: true,
    },
  ];
};
