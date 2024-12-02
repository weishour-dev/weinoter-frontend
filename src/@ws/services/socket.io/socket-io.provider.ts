import { EnvironmentProviders, Provider } from '@angular/core';
import { SocketIoConfig } from '@ws/interfaces';
import { WS_SOCKET_IO_CONFIG } from '@ws/services/socket.io/socket-io.constants';
import { WrappedSocket } from './socket-io.service';

/**
 * SocketIo提供商
 */
export const provideSocketIo = (config?: SocketIoConfig): Array<Provider | EnvironmentProviders> => {
  return [
    { provide: WS_SOCKET_IO_CONFIG, useValue: config },
    {
      provide: WrappedSocket,
      useFactory: () => new WrappedSocket(config),
      deps: [WS_SOCKET_IO_CONFIG],
    },
  ];
};
