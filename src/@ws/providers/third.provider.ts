import { EnvironmentProviders, Provider } from '@angular/core';
import { WA_GEOLOCATION_SUPPORT } from '@ng-web-apis/geolocation';
import { provideTippyConfig } from '@ngneat/helipopper';
import { provideHotToastConfig } from '@ngneat/hot-toast';
import {
  provideIndexedDBDataBaseName,
  provideIndexedDBStoreName,
  provideLocalStoragePrefix,
} from '@ngx-pwa/local-storage';
import { provideSocketIo } from '@ws/services';
import { localStorageConfig, tippyConfig, toastConfig } from 'app/core/config';
import { provideEchartsCore } from 'ngx-echarts';
import { provideNgxLocalstorage } from 'ngx-localstorage';
import * as echarts from 'echarts/core';

/**
 * 第三方组件提供商
 */
export const provideThird = (): Array<Provider | EnvironmentProviders> => {
  return [
    // 本地存储提供商
    provideNgxLocalstorage(localStorageConfig),
    provideLocalStoragePrefix(''),
    provideIndexedDBDataBaseName('WSSF'),
    provideIndexedDBStoreName('localStorage'),
    // Echarts提供商
    provideEchartsCore({ echarts }),
    // HotToast提供商
    provideHotToastConfig(toastConfig),
    // Helipopper提供商
    provideTippyConfig(tippyConfig),
    // SocketIo提供商
    provideSocketIo(),
    // geolocation提供商
    {
      provide: WA_GEOLOCATION_SUPPORT,
      useValue: { enableHighAccuracy: true, timeout: 3000, maximumAge: 1000 },
    },
  ];
};
