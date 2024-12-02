import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withPreloading,
  withViewTransitions,
} from '@angular/router';
import { provideThird, provideWs } from '@ws/providers';
import { INTERCEPTOR_PROVIDES } from '@ws/services/http';
import { appRoutes } from 'app/app.routes';
import { wsConfig } from 'app/core/config';
import { quicklinkProviders, QuicklinkStrategy } from 'ngx-quicklink';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideHttpClient(withFetch(), withInterceptors(INTERCEPTOR_PROVIDES)),
    // 路由配置
    quicklinkProviders,
    provideRouter(
      appRoutes,
      withComponentInputBinding(),
      withPreloading(QuicklinkStrategy),
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
      withViewTransitions(),
      // withHashLocation(),
    ),

    // Ws提供商
    provideWs(wsConfig),

    // 第三方提供商
    provideThird(),
  ],
};
