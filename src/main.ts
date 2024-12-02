import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { registerLicense } from '@syncfusion/ej2-base';
import { AppComponent } from 'app/app.component';
import { appConfig } from 'app/app.config';
import { environment } from 'environments/environment';
import { ThemeServiceInit } from 'ng-devui/theme';

/** 注册Syncfusion许可密钥 */
registerLicense('ORg4AjUWIQA/Gnt2UlhhQlVMfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hTX9Sd01jUX9XdHVVQWhe');

/** DevUI开启主题化 */
ThemeServiceInit();

/** 生产模式 */
if (environment.production) enableProdMode();

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
