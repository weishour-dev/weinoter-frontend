import { NgClass } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WsFullscreenComponent } from '@ws/components/fullscreen';
import { WsLoadingBarComponent } from '@ws/components/loading-bar';
import { WsLogoComponent } from '@ws/components/logo';
import { WsNavigationItem, WsNavigationService } from '@ws/components/navigation';
import { WsHorizontalNavigationComponent } from '@ws/components/navigation/horizontal/horizontal.component';
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
  selector: 'mix-layout',
  templateUrl: './mix.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    NgClass,
    RouterOutlet,
    MatIconModule,
    MatButtonModule,
    WsLogoComponent,
    WsLoadingBarComponent,
    WsReuseTabComponent,
    WsVerticalNavigationComponent,
    WsVerticalNavigationDividerItemComponent,
    WsHorizontalNavigationComponent,
    BreadcrumbComponent,
    SchemesComponent,
    LanguagesComponent,
    WsFullscreenComponent,
    SearchComponent,
    MessagesComponent,
    NotificationsComponent,
    UserComponent,
  ],
})
export class MixLayoutComponent implements OnInit, AfterViewInit {
  verticalNavigationName = 'mainNavigation';
  verticalNavigation: WsNavigationItem[];
  isScreenSmall: boolean;
  navigation: Navigation;
  /** 导航外观 */
  navigationAppearance: 'default' | 'compact' | 'thin' = 'compact';
  /** 导航折叠外观 */
  appearance: 'compact' | 'thin' = 'compact';
  /** 导航外观是否折叠 */
  toggleAppearance = true;
  /** 折叠导航图标 */
  toggleNavigationIcon = 'ws:menu_collapse';
  /** 侧边底部切换导航图标 */
  switchNavigationIcon = 'feather:chevrons-left';

  /**
   * 构造函数
   */
  constructor(
    private _navigationService: NavigationService,
    private _wsMediaWatcherService: WsMediaWatcherService,
    private _wsNavigationService: WsNavigationService,
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
      this.verticalNavigation = this.toggleAppearance ? this.navigation.compact : this.navigation.default;
    });

    // 订阅媒体更改
    this._wsMediaWatcherService.onMediaChange$.pipe(untilDestroyed(this)).subscribe(({ matchingAliases }) => {
      // 检查屏幕是否小
      this.isScreenSmall = !matchingAliases.includes('md');

      // 当页面宽度缩小并且侧边菜单展开时
      if (this.isScreenSmall && !this.toggleAppearance) {
        // 更改导航外观
        this.toggleAppearance = !this.isScreenSmall;
        // 切换导航外观处理
        this._toggleNavigationAppearance();
      }
    });
  }

  /**
   * 视图初始化后
   */
  ngAfterViewInit(): void {
    const wsNavigation = this._wsNavigationService.getComponent<WsVerticalNavigationComponent>(
      this.verticalNavigationName,
    );

    // 订阅导航模式变化
    wsNavigation.modeChanged.pipe(untilDestroyed(this)).subscribe(mode => this._toggleNavigationIcon(mode === 'side'));

    if (wsNavigation) this._toggleNavigationIcon(wsNavigation.opened);
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 折叠导航
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
      if (navigation.mode === 'side') this._toggleNavigationIcon(navigation.opened);
    }
  }

  /**
   * 切换导航外观
   */
  toggleNavigationAppearance(): void {
    this.toggleAppearance = !this.toggleAppearance;
    // 切换导航外观处理
    this._toggleNavigationAppearance();
  }

  /**
   * 切换导航
   */
  switchNavigation(): void {
    if (this.navigationAppearance === 'default') {
      this.navigationAppearance = this.appearance;
      this.switchNavigationIcon = this.appearance === 'compact' ? 'feather:chevrons-left' : 'feather:chevrons-right';
    } else {
      if (this.appearance === 'compact') {
        this.navigationAppearance = 'thin';
        this.appearance = 'thin';
        this.switchNavigationIcon = 'feather:chevrons-right';
      } else {
        this.navigationAppearance = 'compact';
        this.appearance = 'compact';
        this.switchNavigationIcon = 'feather:chevrons-left';
      }
    }

    this.toggleAppearance = true;
    this.verticalNavigation = this.toggleAppearance ? this.navigation.compact : this.navigation.default;
  }

  // ----------------------------------------------------------------------------
  // @ 私有方法
  // ----------------------------------------------------------------------------

  /**
   * 折叠导航图标
   *
   * @param opened
   */
  private _toggleNavigationIcon(opened: boolean): void {
    setTimeout(() => {
      this.toggleNavigationIcon = opened ? 'ws:menu_collapse' : 'ws:menu_expand';
    });
  }

  /**
   * 切换导航外观处理
   */
  private _toggleNavigationAppearance(): void {
    // 切换导航外观
    this.navigationAppearance = this.toggleAppearance ? this.appearance : 'default';
    // 底部切换导航图标
    if (!this.toggleAppearance) {
      this.switchNavigationIcon = 'feather:chevrons-left';
    } else {
      this.switchNavigationIcon = this.appearance === 'compact' ? 'feather:chevrons-left' : 'feather:chevrons-right';
    }
    // 侧边菜单数据
    this.verticalNavigation = this.toggleAppearance ? this.navigation.compact : this.navigation.default;
  }
}
