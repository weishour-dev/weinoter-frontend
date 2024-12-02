import { APP_INITIALIZER, EnvironmentProviders, inject, Provider } from '@angular/core';
import { provideTransloco, TranslocoService } from '@ngneat/transloco';
import { provideTranslocoLocale } from '@ngneat/transloco-locale';
import { provideTranslocoPersistTranslations } from '@ngneat/transloco-persist-translations';
import { TranslocoHttpLoader } from '@ws/services/transloco';
import { environment } from 'environments/environment';
import { firstValueFrom } from 'rxjs';

/**
 * 国际化提供商
 */
export const provideWsTransloco = (): Array<Provider | EnvironmentProviders> => {
  return [
    provideTransloco({
      config: {
        // 可用的语言
        availableLangs: [
          { id: 'zh', label: '简体中文' },
          { id: 'en', label: 'English' },
        ],
        // 加载重试次数
        failedRetries: 1,
        // 设置默认语言
        defaultLang: JSON.parse(localStorage.getItem('ws-config'))?.defaultLang ?? 'zh',
        // 设置默认语言以当做备用
        fallbackLang: ['zh', 'en'],
        // 是否运行时更改语言
        reRenderOnLangChange: true,
        // 是否在生产模式下运行
        prodMode: environment.production,
        // 检查优化插件
        flatten: { aot: environment.production },
        missingHandler: {
          // 是否允许空值
          allowEmpty: true,
          // 是否对缺少的键或值使用后备语言
          useFallbackTranslation: true,
          // 是否 console.warn 缺少键
          logMissingKey: false,
        },
      },
      loader: TranslocoHttpLoader,
    }),
    {
      // 在应用程序开始前预加载默认语言，以防止空/跳跃的内容
      provide: APP_INITIALIZER,
      useFactory: () => {
        const translocoService = inject(TranslocoService);
        const defaultLang = translocoService.getDefaultLang();
        translocoService.setActiveLang(defaultLang);
        return () => firstValueFrom(translocoService.load(defaultLang));
      },
      multi: true,
    },
    // 本地化插件
    provideTranslocoLocale(),
    // 将翻译持久保存到所提供存储
    provideTranslocoPersistTranslations({
      loader: TranslocoHttpLoader,
      storage: { useValue: localStorage },
    }),
  ];
};
