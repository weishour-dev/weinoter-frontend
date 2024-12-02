import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ItemModel } from '@syncfusion/ej2-angular-navigations';
import { EmitType } from '@syncfusion/ej2-base';
import { WsNavigationService } from '@ws/components/navigation';
import { WsMessageService } from '@ws/services/message';
import { UsersService } from 'app/core/systems/users';
import { Adapter, Enforcer, Model, newEnforcer, newModelFromString, StringAdapter } from 'casbin';
import { find, isEmpty, startsWith } from 'lodash-es';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WsCasbinService {
  /** enforcer实例 */
  enforcer!: Enforcer;
  /** 访问模型 */
  model!: Model;
  /** 权限配置 */
  adapter!: Adapter;

  /**
   * 构造函数
   */
  constructor(
    private _router: Router,
    private _usersService: UsersService,
    private _wsMessageService: WsMessageService,
    private _wsNavigationService: WsNavigationService,
  ) {
    this.model = newModelFromString(`
      # 请求参数
      [request_definition]
      r = sub, obj, act

      # 访问策略的模式
      [policy_definition]
      p = sub, obj, act

      # 角色定义
      [role_definition]
      g = _, _
      g2 = _, _

      # 策略的结果
      [policy_effect]
      e = some(where (p.eft == allow))

      # 匹配请求和政策的规则
      [matchers]
      m = g(r.sub, p.sub) && g2(r.obj, p.obj) && r.act == p.act || r.sub == "user_admin"
    `);
  }

  // ----------------------------------------------------------------------------
  // @ 访问器
  // ----------------------------------------------------------------------------

  /**
   * 获取当前路由菜单id
   */
  get menuId(): number {
    return this._wsNavigationService.getNavigationId(this._router);
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 验证当前用户是否拥有操作权限
   *
   * @param action
   * @param type
   * @returns
   */
  async enforce(
    param: {
      action: string;
      type?: string;
    },
    click?: EmitType<boolean>,
  ): Promise<boolean> {
    const type = param.type ?? 'ACTION';
    const username = this._usersService.currentUser.username;
    // 当前用户以及继承的所有权限
    const policy = await lastValueFrom(this._usersService.getImplicitResourcesForUser(username), {
      defaultValue: '',
    });

    let isAllow = false;

    // 判断权限策略是否为空
    if (isEmpty(policy)) {
      if (username === 'admin') {
        isAllow = true;
        click(isAllow);
      } else {
        this._wsMessageService.toast('error', '未拥有该操作权限，操作失败');
      }
    } else {
      this.adapter = new StringAdapter(policy);

      // 用户主体和操作
      const sub = `user_${username}`;
      const obj = `${this.menuId}:${type}:${param.action}`;
      this.enforcer = await newEnforcer(this.model, this.adapter);

      // 检查是否拥有权限
      isAllow = await this.enforcer.enforce(sub, obj, 'allow');

      if (isAllow) {
        click(isAllow);
      } else {
        this._wsMessageService.toast('error', '未拥有该操作权限，操作失败');
      }
    }

    return isAllow;
  }

  /**
   * 获取工具栏action
   *
   * @param item
   * @returns
   */
  getToolbarAction(item: ItemModel): string {
    let action = '';

    // 从cssClass属性中获取action
    const cssClassArray = item.cssClass.split(' ');
    // 查找以'action-'开头的class否则为id名称
    action = find(cssClassArray, css => startsWith(css, 'action-')) ?? item.id;
    // 如果是以'action-'开头则获取后面字符串
    action = startsWith(action, 'action-') ? action.split('-')[1] : action;

    return action;
  }
}
