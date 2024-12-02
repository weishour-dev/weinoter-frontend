import { NgClass } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WsFullscreenComponent } from '@ws/components/fullscreen';
import { WsLoadingBarComponent } from '@ws/components/loading-bar';
import { WsLogoComponent } from '@ws/components/logo';
import { WsNavigationService } from '@ws/components/navigation';
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
  selector: 'dense-layout',
  templateUrl: './dense.component.html',
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
export class DenseLayoutComponent implements OnInit {
  isScreenSmall: boolean;
  navigation: Navigation;
  navigationAppearance: 'default' | 'dense' = 'dense';

  /**
   * 构造函数
   */
  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
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
    });

    // 订阅媒体更改
    this._wsMediaWatcherService.onMediaChange$.pipe(untilDestroyed(this)).subscribe(({ matchingAliases }) => {
      // 检查屏幕是否小
      this.isScreenSmall = !matchingAliases.includes('md');

      // 更改导航外观
      this.navigationAppearance = this.isScreenSmall ? 'default' : 'dense';
    });
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
    }
  }

  /**
   * 切换导航外观
   */
  toggleNavigationAppearance(): void {
    this.navigationAppearance = this.navigationAppearance === 'default' ? 'dense' : 'default';
  }
}