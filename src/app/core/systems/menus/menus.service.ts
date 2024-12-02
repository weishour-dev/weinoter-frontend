import { Injectable } from '@angular/core';
import { GetParam, Result } from '@ws/interfaces';
import { GridProvider } from '@ws/providers';
import { WsHttpService } from '@ws/services/http';
import { Routes } from 'app/core/config';
import { BaseService } from 'app/core/services/base.service';
import { IColumnMenuModel, MenuModel } from 'app/core/systems/menus/interfaces';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MenusService extends BaseService<{ T: IColumnMenuModel; K: MenuModel }> {
  apiPoint = Routes.systems.menus;

  constructor(gridProvider: GridProvider, wsHttpService: WsHttpService) {
    super(gridProvider, wsHttpService);
  }

  /**
   * 获取所有菜单数据
   *
   * @param param
   * @returns Observable<MenuModel[]>
   */
  getAll(param: GetParam): Observable<MenuModel[]> {
    return this.wsHttpService
      .get<Result<MenuModel[]>>(this.apiPoint, param, { toast: false })
      .pipe(map(result => result.data));
  }

  /**
   * 获取所有菜单数据（树状）
   *
   * @returns Observable<MenuModel[]>
   */
  getAllTree(): Observable<MenuModel[]> {
    return this.wsHttpService
      .get<Result<MenuModel[]>>(`${this.apiPoint}/tree`, {}, { toast: false })
      .pipe(map(result => result.data));
  }

  /**
   * 获取上级菜单列表
   *
   * @returns Observable<MenuModel[]>
   */
  parent(): Observable<MenuModel[]> {
    return this.wsHttpService
      .get<Result<MenuModel[]>>(`${this.apiPoint}/parent`, {}, { toast: false })
      .pipe(map(result => result.data));
  }
}
