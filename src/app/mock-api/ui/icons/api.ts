import { Injectable } from '@angular/core';
import { WsMockApiService } from '@ws/lib/mock-api';
import type { SafeAny } from '@ws/types';
import { feather, heroicons, label_classify, material, menus, ws } from 'app/mock-api/ui/icons/data';
import { cloneDeep } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class IconsMockApi {
  private readonly _feather: SafeAny = feather;
  private readonly _heroicons: SafeAny = heroicons;
  private readonly _material: SafeAny = material;
  private readonly _menus: SafeAny = menus;
  private readonly _label_classify: SafeAny = label_classify;
  private readonly _ws: SafeAny = ws;

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
    // @ Feather icons - GET
    // ----------------------------------------------------------------------------
    this._wsMockApiService.onGet('api/ui/icons/feather').reply(() => [
      200,
      {
        namespace: 'feather',
        name: 'Feather',
        grid: 'icon-size-6',
        list: cloneDeep(this._feather),
      },
    ]);

    // ----------------------------------------------------------------------------
    // @ Heroicons outline icons - GET
    // ----------------------------------------------------------------------------
    this._wsMockApiService.onGet('api/ui/icons/heroicons-outline').reply(() => [
      200,
      {
        namespace: 'heroicons_outline',
        name: 'Heroicons Outline',
        grid: 'icon-size-6',
        list: cloneDeep(this._heroicons),
      },
    ]);

    // ----------------------------------------------------------------------------
    // @ Heroicons solid icons - GET
    // ----------------------------------------------------------------------------
    this._wsMockApiService.onGet('api/ui/icons/heroicons-solid').reply(() => [
      200,
      {
        namespace: 'heroicons_solid',
        name: 'Heroicons Solid',
        grid: 'icon-size-5',
        list: cloneDeep(this._heroicons),
      },
    ]);

    // ----------------------------------------------------------------------------
    // @ Material solid icons - GET
    // ----------------------------------------------------------------------------
    this._wsMockApiService.onGet('api/ui/icons/material-solid').reply(() => [
      200,
      {
        namespace: 'mat_solid',
        name: 'Material Solid',
        grid: 'icon-size-6',
        list: cloneDeep(this._material),
      },
    ]);

    // ----------------------------------------------------------------------------
    // @ Material outline icons - GET
    // ----------------------------------------------------------------------------
    this._wsMockApiService.onGet('api/ui/icons/material-outline').reply(() => [
      200,
      {
        namespace: 'mat_outline',
        name: 'Material Outline',
        grid: 'icon-size-6',
        list: cloneDeep(this._material),
      },
    ]);

    // ----------------------------------------------------------------------------
    // @ Material twotone icons - GET
    // ----------------------------------------------------------------------------
    this._wsMockApiService.onGet('api/ui/icons/material-twotone').reply(() => [
      200,
      {
        namespace: '',
        name: 'Material Twotone',
        grid: 'icon-size-6',
        list: cloneDeep(this._material),
      },
    ]);

    // ----------------------------------------------------------------------------
    // @ Label Classify icons - GET
    // ----------------------------------------------------------------------------
    this._wsMockApiService.onGet('api/ui/icons/menus').reply(() => [
      200,
      {
        namespace: 'menus',
        name: 'Menus',
        grid: 'icon-size-6',
        list: cloneDeep(this._menus),
      },
    ]);

    // ----------------------------------------------------------------------------
    // @ Label Classify icons - GET
    // ----------------------------------------------------------------------------
    this._wsMockApiService.onGet('api/ui/icons/label-classify').reply(() => [
      200,
      {
        namespace: 'label_classify',
        name: 'Label Classify',
        grid: 'icon-size-6',
        list: cloneDeep(this._label_classify),
      },
    ]);

    // ----------------------------------------------------------------------------
    // @ Ws icons - GET
    // ----------------------------------------------------------------------------
    this._wsMockApiService.onGet('api/ui/icons/ws').reply(() => [
      200,
      {
        namespace: 'ws',
        name: 'Ws',
        grid: 'icon-size-6',
        list: cloneDeep(this._ws),
      },
    ]);
  }
}
