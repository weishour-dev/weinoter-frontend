import { Injectable } from '@angular/core';
import { WsNavigationItem } from '@ws/components/navigation';
import { WsMockApiService } from '@ws/lib/mock-api';
import {
  compactNavigation,
  defaultNavigation,
  futuristicNavigation,
  horizontalNavigation,
} from 'app/mock-api/common/navigation/data';
import { cloneDeep } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class NavigationMockApi {
  private readonly _compactNavigation: WsNavigationItem[] = compactNavigation;
  private readonly _defaultNavigation: WsNavigationItem[] = defaultNavigation;
  private readonly _futuristicNavigation: WsNavigationItem[] = futuristicNavigation;
  private readonly _horizontalNavigation: WsNavigationItem[] = horizontalNavigation;

  /**
   * 构造函数
   */
  constructor(private _wsMockApiService: WsMockApiService) {
    // Register Mock API handlers
    this.registerHandlers();
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * Register Mock API handlers
   */
  registerHandlers(): void {
    // ----------------------------------------------------------------------------
    // @ Navigation - GET
    // ----------------------------------------------------------------------------
    this._wsMockApiService.onGet('api/common/navigation').reply(() => {
      // Fill compact navigation children using the default navigation
      this._compactNavigation.forEach(compactNavItem => {
        this._defaultNavigation.forEach(defaultNavItem => {
          if (defaultNavItem.id === compactNavItem.id) {
            compactNavItem.children = cloneDeep(defaultNavItem.children);
          }
        });
      });

      // Fill futuristic navigation children using the default navigation
      this._futuristicNavigation.forEach(futuristicNavItem => {
        this._defaultNavigation.forEach(defaultNavItem => {
          if (defaultNavItem.id === futuristicNavItem.id) {
            futuristicNavItem.children = cloneDeep(defaultNavItem.children);
          }
        });
      });

      // Fill horizontal navigation children using the default navigation
      this._horizontalNavigation.forEach(horizontalNavItem => {
        this._defaultNavigation.forEach(defaultNavItem => {
          if (defaultNavItem.id === horizontalNavItem.id) {
            horizontalNavItem.children = cloneDeep(defaultNavItem.children);
          }
        });
      });

      // Return the response
      return [
        200,
        {
          compact: cloneDeep(this._compactNavigation),
          default: cloneDeep(this._defaultNavigation),
          futuristic: cloneDeep(this._futuristicNavigation),
          horizontal: cloneDeep(this._horizontalNavigation),
        },
      ];
    });
  }
}
