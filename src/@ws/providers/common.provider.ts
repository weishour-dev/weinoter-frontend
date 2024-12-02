import { EnvironmentProviders, Provider } from '@angular/core';
import { WsSocket } from '@ws/providers';

/**
 * 共同提供商
 */
export const provideCommon = (): Array<Provider | EnvironmentProviders> => {
  return [WsSocket];
};
