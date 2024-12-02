import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { StorageService } from '@ws/services/storage';
import { WsConfig } from 'app/core/config';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SyncfusionLoader {
  private _httpClient = inject(HttpClient);
  private _storageService = inject(StorageService);

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 获取主题样式
   *
   * @param theme
   */
  getTheme(theme: string): Observable<string> {
    const themeName = theme.split('-')[1];
    const isDark = this._storageService.get<WsConfig>('ws-config').isDark;
    const dark = isDark ? '-dark' : '';

    return this._httpClient.get(`assets/styles/syncfusion/${themeName}-material${dark}.min.css`, {
      responseType: 'text',
    });
  }
}
