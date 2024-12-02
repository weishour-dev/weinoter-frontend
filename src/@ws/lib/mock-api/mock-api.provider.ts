import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, EnvironmentProviders, Provider } from '@angular/core';
import { mockApiInterceptor, WS_MOCK_API_DEFAULT_DELAY } from '@ws/lib/mock-api';
import type { SafeAny } from '@ws/types';

/**
 * MockApi提供商
 */
export const provideMockApi = (
  mockApiServices: SafeAny[],
  config?: { delay?: number },
): Array<Provider | EnvironmentProviders> => {
  return [
    provideHttpClient(withInterceptors([mockApiInterceptor])),
    {
      provide: APP_INITIALIZER,
      deps: [...mockApiServices],
      useFactory: () => (): SafeAny => null,
      multi: true,
    },
    { provide: WS_MOCK_API_DEFAULT_DELAY, useValue: config?.delay ?? 0 },
  ];
};
