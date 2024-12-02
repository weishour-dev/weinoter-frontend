import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WsCardComponent } from '@ws/components/card';
import { WsDrawerService } from '@ws/components/drawer';
import { WsTranslocoComponent } from '@ws/components/transloco';
import { WsConfirmationService } from '@ws/services/confirmation';
import { AuthService } from 'app/core/auth/auth.service';
import { User, UsersService } from 'app/core/systems/users';
import { MenuIds, WsUserMenusConfig } from 'app/layout/common/user';
import { DropDownModule } from 'ng-devui';

@UntilDestroy()
@Component({
  selector: 'user',
  templateUrl: './user.component.html',
  styles: [
    `
      .ws-button-list {
        @apply w-full;
        .mdc-button__label {
          @apply w-full;
          .ws-icon-right {
            width: 1.25rem !important;
            height: 1.25rem !important;
            min-width: 1.25rem !important;
            min-height: 1.25rem !important;
          }
        }
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'user',
  standalone: true,
  imports: [NgTemplateOutlet, MatIconModule, MatButtonModule, WsCardComponent, WsTranslocoComponent, DropDownModule],
})
export class UserComponent implements OnInit {
  @Input() showAvatar: boolean = true;
  user: User;

  userMenus: WsUserMenusConfig[] = [
    {
      type: 'basic',
      id: 'profile',
      icon: 'heroicons_outline:user-circle',
      translation: 'user.profile',
    },
    {
      type: 'basic',
      id: 'settings',
      icon: 'mat_outline:palette',
      translation: 'settings.name',
    },
    {
      type: 'divider',
    },
    {
      type: 'basic',
      id: 'logout',
      icon: 'heroicons_outline:logout',
      translation: 'user.logout',
    },
  ];

  /**
   * 构造函数
   */
  constructor(
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _usersService: UsersService,
    private _authService: AuthService,
    private _wsDrawerService: WsDrawerService,
    private _wsConfirmationService: WsConfirmationService,
  ) {}

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    // 订阅用户数据更改
    this._usersService.user$.pipe(untilDestroyed(this)).subscribe((user: User) => {
      this.user = user;

      // 检测变更
      this._changeDetectorRef.markForCheck();
    });
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 更新用户状态
   *
   * @param status
   */
  updateUserStatus(status: string): void {
    // 如果用户不可用则返回
    if (!this.user) {
      return;
    }

    // 更新用户
    this._usersService.update({ ...this.user, status }).subscribe();
  }

  /**
   * 个人中心
   */
  profile(): void {
    this._router.navigate(['profile/settings']);
  }

  /**
   * 切换设置
   */
  toggleSettings(): void {
    // 获取设置抽屉组件
    const settingsDrawer = this._wsDrawerService.getComponent('settingsDrawer');

    settingsDrawer.toggle();
  }

  /**
   * 登出
   */
  signOut(): void {
    const dialogRef = this._wsConfirmationService.show('warning', '系统提示', '确认要退出登录吗？');

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirmed') {
        this._router.navigate(['sign-out']);
      }
    });
  }

  /**
   * 用户菜单操作
   *
   * @param id
   */
  userMenuClick(id: MenuIds): void {
    switch (id) {
      case 'profile':
        this.profile();
        break;
      case 'settings':
        this.toggleSettings();
        break;
      case 'logout':
        this.signOut();
        break;
    }
  }

  /**
   * 下拉状态
   *
   * @param event
   */
  onToggle(event: boolean): void {}
}
