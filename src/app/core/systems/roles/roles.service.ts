import { Injectable } from '@angular/core';
import { Result } from '@ws/interfaces';
import { GridProvider } from '@ws/providers';
import { WsHttpService } from '@ws/services/http';
import { Routes } from 'app/core/config';
import { BaseService } from 'app/core/services/base.service';
import { IColumnRoleModel, RoleModel } from 'app/core/systems/roles/interfaces';
import { User } from 'app/core/systems/users';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RolesService extends BaseService<{ T: IColumnRoleModel; K: RoleModel }> {
  apiPoint = Routes.systems.roles;

  constructor(gridProvider: GridProvider, wsHttpService: WsHttpService) {
    super(gridProvider, wsHttpService);
  }

  // ----------------------------------------------------------------------------
  // @ 用户
  // ----------------------------------------------------------------------------

  /**
   * 获取用户
   *
   * @param roleId
   * @returns
   */
  getUsers(roleId: number): Observable<User[]> {
    return this.wsHttpService
      .get<Result<User[]>>(`${this.apiPoint}/users/${roleId}`, {}, { toast: false })
      .pipe(map(result => result.data));
  }
}
