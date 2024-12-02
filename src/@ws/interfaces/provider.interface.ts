import type { SafeAny } from '@ws/types';
import { WsConfig } from 'app/core/config';

export type WsProviderConfig = {
  mockApi?: {
    delay?: number;
    services?: SafeAny[];
  };
  ws?: WsConfig;
};
