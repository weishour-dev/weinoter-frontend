import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WsMediaWatcherService } from '@ws/services/media-watcher';
import type { SafeAny } from '@ws/types';
import { ProfileAccountComponent } from 'app/modules/admin/profile/account';
import { ProfileSecurityComponent } from 'app/modules/admin/profile/security';

@UntilDestroy()
@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgClass, MatSidenavModule, MatIconModule, ProfileAccountComponent, ProfileSecurityComponent],
})
export class ProfileComponent implements OnInit {
  @ViewChild('drawer') drawer: MatDrawer;
  drawerMode: 'over' | 'side' = 'side';
  drawerOpened: boolean = true;
  panels: SafeAny[] = [];
  selectedPanel: string = 'account';

  /**
   * 构造函数
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _wsMediaWatcherService: WsMediaWatcherService,
  ) {}

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    // 设置个人面板列表
    this.panels = [
      {
        id: 'account',
        icon: 'heroicons_outline:user-circle',
        title: '账户信息',
        description: '管理您的账号信息',
      },
      {
        id: 'security',
        icon: 'heroicons_outline:lock-closed',
        title: '账号安全',
        description: '管理您的密码',
      },
    ];

    // 订阅媒体更改
    this._wsMediaWatcherService.onMediaChange$.pipe(untilDestroyed(this)).subscribe(({ matchingAliases }) => {
      // 设置drawerMode和drawerOpened
      if (matchingAliases.includes('lg')) {
        this.drawerMode = 'side';
        this.drawerOpened = true;
      } else {
        this.drawerMode = 'over';
        this.drawerOpened = false;
      }

      // 检测变更
      this._changeDetectorRef.markForCheck();
    });
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 导航到面板
   *
   * @param panel
   */
  goToPanel(panel: string): void {
    this.selectedPanel = panel;

    // 在over模式下关闭抽屉
    if (this.drawerMode === 'over') {
      this.drawer.close();
    }
  }

  /**
   * Get the details of the panel
   *
   * @param id
   */
  getPanelInfo(id: string): SafeAny {
    return this.panels.find(panel => panel.id === id);
  }
}
