import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Result } from '@ws/interfaces';
import { GridProvider } from '@ws/providers';
import { WsHttpService } from '@ws/services/http';
import { StorageService } from '@ws/services/storage';
import type { SafeAny } from '@ws/types';
import { ConfigProvider, Routes } from 'app/core/config';
import { BaseService } from 'app/core/services/base.service';
import { Department } from 'app/core/systems/departments';
import { RoleModel } from 'app/core/systems/roles';
import { UserGroup } from 'app/core/systems/user-groups';
import {
  BatchSetDepartmentDto,
  IColumnUserModel,
  ProfileAccountDto,
  ProfilePasswordDto,
  RemoveDepartmentDto,
  RemoveGroupDto,
  RemoveRoleDto,
  SetDepartmentsDto,
  SetGroupsDto,
  SetRolesDto,
  User,
} from 'app/core/systems/users/interfaces';
import { merge, omit } from 'lodash-es';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsersService extends BaseService<{ T: IColumnUserModel; K: User }> {
  apiPoint = Routes.systems.users;
  private _user: BehaviorSubject<User> = new BehaviorSubject<User>(
    this._storageService.get<User>(this._configProvider.AUTH_KEY),
  );

  /**
   * 构造函数
   */
  constructor(
    gridProvider: GridProvider,
    wsHttpService: WsHttpService,
    private _httpClient: HttpClient,
    private _configProvider: ConfigProvider,
    private _storageService: StorageService,
  ) {
    super(gridProvider, wsHttpService);
  }

  // ----------------------------------------------------------------------------
  // @ 访问器
  // ----------------------------------------------------------------------------

  get user$(): Observable<User> {
    return this._user.asObservable();
  }

  /**
   * 获取当前用户信息
   */
  get currentUser(): User {
    return this._user.value;
  }

  /**
   * 设置访问器 用户
   *
   * @param value
   */
  set user(value: User) {
    // 存储值
    this._user.next(value);
  }

  /**
   * 设置访问器 当前用户
   *
   * @param value
   */
  set currentUser(value: User) {
    if (this.currentUser.id !== value.id) return;

    const userData = merge({}, this.currentUser, omit(value, ['password']));
    if (this.currentUser.username === 'admin') userData.username = 'admin';

    // 更新当前用户服务信息
    this._storageService.set(this._configProvider.AUTH_KEY, userData);
    this._user.next(userData);
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 获取当前登录的用户数据
   */
  get(): Observable<Result<User>> {
    return this.wsHttpService.get<Result<User>>(`${this.apiPoint}/${this.currentUser.id}`, {}, { toast: false }).pipe(
      tap(result => {
        this._user.next(result.data);
      }),
    );
  }

  /**
   * 修改账户
   *
   * @param profileAccountDto
   * @returns
   */
  profileAccount(profileAccountDto: ProfileAccountDto): Observable<string> {
    return this.wsHttpService
      .post<Result<string>>(`${this.apiPoint}/profile/account`, profileAccountDto)
      .pipe(map(result => result.message));
  }

  /**
   * 修改密码
   *
   * @param profilePasswordDto
   * @returns
   */
  profilePassword(profilePasswordDto: ProfilePasswordDto): Observable<string> {
    return this.wsHttpService
      .post<Result<string>>(`${this.apiPoint}/profile/password`, profilePasswordDto)
      .pipe(map(result => result.message));
  }

  /**
   * 更新用户
   *
   * @param user
   */
  update(user: User): Observable<SafeAny> {
    return this._httpClient.patch<User>('api/common/user', { user }).pipe(
      map(response => {
        this._user.next(response);
      }),
    );
  }

  /**
   * 获取当前用户以及继承的所有权限
   *
   * @param username
   * @returns
   */
  getImplicitResourcesForUser(username: string): Observable<string> {
    return this.wsHttpService
      .post<Result<string>>(`${this.apiPoint}/casbin/permissions`, { username }, { toast: false })
      .pipe(map(result => result.data));
  }

  // ----------------------------------------------------------------------------
  // @ 部门
  // ----------------------------------------------------------------------------

  /**
   * 设置部门
   *
   * @param setDepartmentsDto
   * @returns
   */
  setDepartments(setDepartmentsDto: SetDepartmentsDto): Observable<string> {
    return this.wsHttpService
      .post<Result<string>>(`${this.apiPoint}/set/departments`, setDepartmentsDto)
      .pipe(map(result => result.message));
  }

  /**
   * 批量设置部门
   *
   * @param batchSetDepartmentDto
   * @returns
   */
  batchSetDepartment(batchSetDepartmentDto: BatchSetDepartmentDto): Observable<string> {
    return this.wsHttpService
      .post<Result<string>>(`${this.apiPoint}/batch/set/department`, batchSetDepartmentDto, {
        toast: false,
      })
      .pipe(map(result => result.message));
  }

  /**
   * 移除部门
   *
   * @param removeDepartmentDto
   * @returns
   */
  removeDepartment(removeDepartmentDto: RemoveDepartmentDto): Observable<string> {
    return this.wsHttpService
      .post<Result<string>>(`${this.apiPoint}/remove/department`, removeDepartmentDto)
      .pipe(map(result => result.message));
  }

  /**
   * 获取部门
   *
   * @param userId
   * @returns
   */
  getDepartments(userId: number): Observable<Department[]> {
    return this.wsHttpService
      .get<Result<Department[]>>(`${this.apiPoint}/departments/${userId}`, {}, { toast: false })
      .pipe(map(result => result.data));
  }

  // ----------------------------------------------------------------------------
  // @ 角色
  // ----------------------------------------------------------------------------

  /**
   * 设置角色
   *
   * @param setRolesDto
   * @returns
   */
  setRoles(setRolesDto: SetRolesDto, toast = true): Observable<string> {
    return this.wsHttpService
      .post<Result<string>>(`${this.apiPoint}/set/roles`, setRolesDto, { toast })
      .pipe(map(result => result.message));
  }

  /**
   * 移除角色
   *
   * @param removeRoleDto
   * @returns
   */
  removeRole(removeRoleDto: RemoveRoleDto): Observable<string> {
    return this.wsHttpService
      .post<Result<string>>(`${this.apiPoint}/remove/role`, removeRoleDto)
      .pipe(map(result => result.message));
  }

  /**
   * 获取角色
   *
   * @param userId
   * @returns
   */
  getRoles(userId: number): Observable<RoleModel[]> {
    return this.wsHttpService
      .get<Result<RoleModel[]>>(`${this.apiPoint}/roles/${userId}`, {}, { toast: false })
      .pipe(map(result => result.data));
  }

  // ----------------------------------------------------------------------------
  // @ 用户组操作
  // ----------------------------------------------------------------------------

  /**
   * 设置用户组
   *
   * @param setGroupsDto
   * @returns
   */
  setUserGroups(setGroupsDto: SetGroupsDto, toast = true): Observable<string> {
    return this.wsHttpService
      .post<Result<string>>(`${this.apiPoint}/set/groups`, setGroupsDto, { toast })
      .pipe(map(result => result.message));
  }

  /**
   * 移除用户组
   *
   * @param removeGroupDto
   * @returns
   */
  removeUserGroup(removeGroupDto: RemoveGroupDto): Observable<string> {
    return this.wsHttpService
      .post<Result<string>>(`${this.apiPoint}/remove/group`, removeGroupDto)
      .pipe(map(result => result.message));
  }

  /**
   * 获取用户组
   *
   * @param userId
   * @returns
   */
  getUserGroups(userId: number): Observable<UserGroup[]> {
    return this.wsHttpService
      .get<Result<UserGroup[]>>(`${this.apiPoint}/groups/${userId}`, {}, { toast: false })
      .pipe(map(result => result.data));
  }
}
