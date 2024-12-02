import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import type { SafeAny } from '@ws/types';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IconsService {
  private _icons: BehaviorSubject<SafeAny> = new BehaviorSubject(null);
  private _httpClient = inject(HttpClient);

  /**
   * 构造函数
   */
  constructor() {
    const domSanitizer = inject(DomSanitizer);
    const matIconRegistry = inject(MatIconRegistry);

    // 注册图标集
    matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/material-twotone.svg'));
    matIconRegistry.addSvgIconSetInNamespace(
      'mat_outline',
      domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/material-outline.svg'),
    );
    matIconRegistry.addSvgIconSetInNamespace(
      'mat_solid',
      domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/material-solid.svg'),
    );
    matIconRegistry.addSvgIconSetInNamespace(
      'feather',
      domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/feather.svg'),
    );
    matIconRegistry.addSvgIconSetInNamespace(
      'heroicons_outline',
      domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/heroicons-outline.svg'),
    );
    matIconRegistry.addSvgIconSetInNamespace(
      'heroicons_solid',
      domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/heroicons-solid.svg'),
    );
    matIconRegistry.addSvgIconSetInNamespace(
      'menus',
      domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/menus.svg'),
    );
    matIconRegistry.addSvgIconSetInNamespace(
      'label_classify',
      domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/label-classify.svg'),
    );
    matIconRegistry.addSvgIconSetInNamespace('ws', domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/ws.svg'));
  }

  // -----------------------------------------------------------------------------------------------------
  // @ 访问器
  // -----------------------------------------------------------------------------------------------------

  /**
   * 获取图标
   */
  get icons(): Observable<SafeAny> {
    return this._icons.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ 公共方法
  // -----------------------------------------------------------------------------------------------------

  /**
   * 获取图标
   *
   * @param url
   */
  getIcons(url: string = 'menus'): Observable<SafeAny> {
    url = 'api/ui/icons/' + url;

    return this._httpClient.get(url).pipe(
      tap((response: SafeAny) => {
        this._icons.next(response);
      }),
    );
  }
}
