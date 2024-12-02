import { InjectionToken } from '@angular/core';
import { WsConfig } from 'app/core/config';

export const WS_CONFIG = new InjectionToken<WsConfig>('WS_CONFIG');
