import { EnvironmentProviders, Provider } from '@angular/core';
import { provideMockApi } from '@ws/lib/mock-api';
import { provideCommon, provideDevUI, provideMaterial, provideReuseTab, provideServices } from '@ws/providers';
import { WS_CONFIG, provideSyncfusion, provideWsTransloco } from '@ws/services';
import { provideAuth } from 'app/core/auth';
import { WsConfig } from 'app/core/config';
import { provideIcons } from 'app/core/icons';
import { mockApiServices } from 'app/mock-api';

/**
 * Ws提供商
 */
export const provideWs = (config: WsConfig): Array<Provider | EnvironmentProviders> => {
  // 从本地获取系统配置
  const systemConfig = localStorage.getItem('ws-config') ?? '';
  config = systemConfig === '' ? config : JSON.parse(systemConfig);

  // 基础提供商
  const providers: Array<Provider | EnvironmentProviders> = [
    { provide: WS_CONFIG, useValue: config },
    // 共同提供商
    provideCommon(),
    // 初始数据请求
    provideAuth(),
    provideIcons(),
    // 基础服务提供商
    provideServices(),
    // Material组件
    provideMaterial(),
    // DevUI提供商
    provideDevUI(),
    // Syncfusion提供商
    provideSyncfusion(),
    // 国际化提供商
    provideWsTransloco(),
    // 路由复用提供商
    provideReuseTab(),
    // MockApi提供商
    provideMockApi(mockApiServices),
  ];

  return providers;
};
