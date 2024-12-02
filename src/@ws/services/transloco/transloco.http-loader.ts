import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Translation, TranslocoLoader } from '@ngneat/transloco';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private _httpClient = inject(HttpClient);

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 获取翻译
   *
   * @param lang
   */
  getTranslation(lang: string): Observable<Translation> {
    return this._httpClient.get<Translation>(`assets/i18n/${lang}.json`);
  }
}
