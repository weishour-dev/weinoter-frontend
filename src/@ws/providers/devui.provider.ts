import { EnvironmentProviders, Provider } from '@angular/core';
import { devUIGlobalConfig } from 'app/core/config';
import { DevUIGlobalConfigToken } from 'ng-devui/utils';

/**
 * DevUI提供商
 */
export const provideDevUI = (): Array<Provider | EnvironmentProviders> => {
  return [{ provide: DevUIGlobalConfigToken, useValue: devUIGlobalConfig }];
};
