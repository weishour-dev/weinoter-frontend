import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WsDrawerService } from '@ws/components/drawer';
import { WsFullscreenComponent } from '@ws/components/fullscreen';
import { WsLoadingBarComponent } from '@ws/components/loading-bar';
import { WsLogoComponent } from '@ws/components/logo';
import { WsNavigationItem, WsNavigationService } from '@ws/components/navigation';
import { WsVerticalNavigationBasicItemComponent } from '@ws/components/navigation/vertical/components/basic';
import { WsVerticalNavigationDividerItemComponent } from '@ws/components/navigation/vertical/components/divider';
import { WsVerticalNavigationComponent } from '@ws/components/navigation/vertical/vertical.component';
import { WsReuseTabComponent } from '@ws/components/reuse-tab';
import { WsMediaWatcherService } from '@ws/services/media-watcher';
import { Navigation, NavigationService } from 'app/core/navigation';
import { BreadcrumbComponent } from 'app/layout/common/breadcrumb';
import { LanguagesComponent } from 'app/layout/common/languages';
import { MessagesComponent } from 'app/layout/common/messages';
import { NotificationsComponent } from 'app/layout/common/notifications';
import { SchemesComponent } from 'app/layout/common/schemes';
import { SearchComponent } from 'app/layout/common/search';
import { UserComponent } from 'app/layout/common/user';

@UntilDestroy()
@Component({
  selector: 'compact-layout',
  templateUrl: './compact.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    RouterOutlet,
    MatIconModule,
    MatButtonModule,
    WsLoadingBarComponent,
    WsReuseTabComponent,
    WsVerticalNavigationComponent,
    WsVerticalNavigationDividerItemComponent,
    WsVerticalNavigationBasicItemComponent,
    BreadcrumbComponent,
    SchemesComponent,
    LanguagesComponent,
    WsFullscreenComponent,
    WsLogoComponent,
    SearchComponent,
    MessagesComponent,
    NotificationsComponent,
    UserComponent,
  ],
})
export class CompactLayoutComponent implements OnInit, AfterViewInit {
  name = 'mainNavigation';
  isScreenSmall: boolean;
  navigation: Navigation;
  toggleNavigationIcon = 'ws:menu_collapse';
  toggleNavigationTooltip = 'collapse';

  /** 系统设置 */
  settingsItem: WsNavigationItem;

  /**
   * 构造函数
   */
  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _navigationService: NavigationService,
    private _wsMediaWatcherService: WsMediaWatcherService,
    private _wsNavigationService: WsNavigationService,
    private _wsDrawerService: WsDrawerService,
  ) {}

  // ----------------------------------------------------------------------------
  // @ 访问器
  // ----------------------------------------------------------------------------

  /**
   * 当前年份
   */
  get currentYear(): number {
    return new Date().getFullYear();
  }

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    // 订阅导航数据
    this._navigationService.navigation$.pipe(untilDestroyed(this)).subscribe((navigation: Navigation) => {
      this.navigation = navigation;
    });

    // 订阅媒体更改
    this._wsMediaWatcherService.onMediaChange$.pipe(untilDestroyed(this)).subscribe(({ matchingAliases }) => {
      // 检查屏幕是否小
      this.isScreenSmall = !matchingAliases.includes('md');
    });

    /** 主题设置 */
    this.settingsItem = {
      type: 'basic',
      translation: 'theme-settings',
      icon: 'mat_outline:palette',
      function: this._toggleSettings.bind(this),
    };
  }

  /**
   * 视图初始化后
   */
  ngAfterViewInit(): void {
    const wsNavigation = this._wsNavigationService.getComponent<WsVerticalNavigationComponent>('mainNavigation');

    // 订阅导航模式变化
    wsNavigation.modeChanged.pipe(untilDestroyed(this)).subscribe(mode => this._toggleNavigationIcon(mode === 'side'));

    if (wsNavigation) {
      this._toggleNavigationIcon(wsNavigation.opened);
    }
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 切换导航
   *
   * @param name
   */
  toggleNavigation(name: string): void {
    // 获取导航
    const navigation = this._wsNavigationService.getComponent<WsVerticalNavigationComponent>(name);

    if (navigation) {
      // 切换打开状态
      navigation.toggle();

      // 当模式为side时，切换导航图标
      if (navigation.mode === 'side') {
        this._toggleNavigationIcon(navigation.opened);
      }
    }
  }

  /**
   * 切换设置
   */
  toggleSettings(): void {
    // 获取设置抽屉组件
    const settingsDrawer = this._wsDrawerService.getComponent('settingsDrawer');

    settingsDrawer.toggle();
  }

  // ----------------------------------------------------------------------------
  // @ 私有方法
  // ----------------------------------------------------------------------------

  /**
   * 切换导航图标
   *
   * @param opened
   */
  private _toggleNavigationIcon(opened: boolean): void {
    setTimeout(() => {
      this.toggleNavigationIcon = opened ? 'ws:menu_collapse' : 'ws:menu_expand';
      this.toggleNavigationTooltip = opened ? 'collapse' : 'expand';
    });
  }

  /**
   * 切换设置
   */
  private _toggleSettings(item: WsNavigationItem): void {
    // 获取设置抽屉组件
    const settingsDrawer = this._wsDrawerService.getComponent('settingsDrawer');

    settingsDrawer.toggle();
  }
}
