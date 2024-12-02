import { Injectable } from '@angular/core';
import { Result } from '@ws/interfaces';
import { GridProvider } from '@ws/providers';
import { WsHttpService } from '@ws/services/http';
import { Routes } from 'app/core/config';
import { BaseService } from 'app/core/services/base.service';
import { IColumnUserGroupModel, UserGroup } from 'app/core/systems/user-groups/interfaces';
import { User } from 'app/core/systems/users';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserGroupsService extends BaseService<{ T: IColumnUserGroupModel; K: UserGroup }> {
  apiPoint = Routes.systems['user-groups'];

  constructor(gridProvider: GridProvider, wsHttpService: WsHttpService) {
    super(gridProvider, wsHttpService);
  }

  // ----------------------------------------------------------------------------
  // @ 用户
  // ----------------------------------------------------------------------------

  /**
   * 获取用户
   *
   * @param userGroupId
   * @returns
   */
  getUsers(userGroupId: number): Observable<User[]> {
    return this.wsHttpService
      .get<Result<User[]>>(`${this.apiPoint}/users/${userGroupId}`, {}, { toast: false })
      .pipe(map(result => result.data));
  }
}
