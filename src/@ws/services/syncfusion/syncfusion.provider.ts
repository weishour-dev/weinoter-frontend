import { APP_INITIALIZER, EnvironmentProviders, inject, Provider } from '@angular/core';
import { enableRipple, L10n, loadCldr } from '@syncfusion/ej2-base';
import { WsConfigService } from '@ws/services/config';
import { SyncfusionLoader, SyncfusionService, WS_SYNCFUSION_THEME } from '@ws/services/syncfusion';
import { chinese } from '@ws/services/syncfusion/i18n';
import { firstValueFrom } from 'rxjs';

import numberingSystems from 'cldr-core/supplemental/numberingSystems.json';

import ca_chinese from 'cldr-cal-chinese-full/main/zh-Hans/ca-chinese.json';

import ca_generic from 'cldr-dates-full/main/zh-Hans/ca-generic.json';
import ca_gregorian from 'cldr-dates-full/main/zh-Hans/ca-gregorian.json';
import dateFields from 'cldr-dates-full/main/zh-Hans/dateFields.json';
import timeZoneNames from 'cldr-dates-full/main/zh-Hans/timeZoneNames.json';

import languages from 'cldr-localenames-full/main/zh-Hans/languages.json';
import localeDisplayNames from 'cldr-localenames-full/main/zh-Hans/localeDisplayNames.json';
import scripts from 'cldr-localenames-full/main/zh-Hans/scripts.json';
import territories from 'cldr-localenames-full/main/zh-Hans/territories.json';
import variants from 'cldr-localenames-full/main/zh-Hans/variants.json';

import characters from 'cldr-misc-full/main/zh-Hans/characters.json';
import delimiters from 'cldr-misc-full/main/zh-Hans/delimiters.json';
import layout from 'cldr-misc-full/main/zh-Hans/layout.json';
import listPatterns from 'cldr-misc-full/main/zh-Hans/listPatterns.json';
import posix from 'cldr-misc-full/main/zh-Hans/posix.json';

import currencies from 'cldr-numbers-full/main/zh-Hans/currencies.json';
import numbers from 'cldr-numbers-full/main/zh-Hans/numbers.json';

import measurementSystemNames from 'cldr-units-full/main/zh-Hans/measurementSystemNames.json';
import units from 'cldr-units-full/main/zh-Hans/units.json';

// 加载CLDR数据
loadCldr(
  numberingSystems,
  ca_chinese,
  ca_generic,
  ca_gregorian,
  dateFields,
  timeZoneNames,
  languages,
  localeDisplayNames,
  scripts,
  territories,
  variants,
  characters,
  delimiters,
  layout,
  listPatterns,
  posix,
  numbers,
  currencies,
  measurementSystemNames,
  units,
);

// 加载本地化语言
L10n.load(chinese.syncfusion);

// 开启涟漪动画效果
enableRipple(true);

/**
 * Syncfusion提供商
 */
export const provideSyncfusion = (): Array<Provider | EnvironmentProviders> => {
  return [
    {
      // 提供默认的Syncfusion加载器
      provide: WS_SYNCFUSION_THEME,
      useClass: SyncfusionLoader,
    },
    {
      // 在应用程序开始前预加载默认Syncfusion主题
      provide: APP_INITIALIZER,
      useFactory: () => {
        const syncfusionService = inject(SyncfusionService);
        const wsConfigService = inject(WsConfigService);
        return async () => firstValueFrom(await syncfusionService.load(wsConfigService.currentConfig.theme));
      },
      multi: true,
    },
  ];
};
