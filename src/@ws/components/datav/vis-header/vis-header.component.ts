import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GeolocationService, WA_GEOLOCATION_SUPPORT } from '@ng-web-apis/geolocation';
import { PermissionsService } from '@ng-web-apis/permissions';
import { TranslocoModule } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { wsAnimations } from '@ws/animations';
import { Decoration10Component } from '@ws/components/datav/decorations/decoration10/decoration10.component';
import { Decoration3Component } from '@ws/components/datav/decorations/decoration3/decoration3.component';
import { Decoration5Component } from '@ws/components/datav/decorations/decoration5/decoration5.component';
import { Decoration6Component } from '@ws/components/datav/decorations/decoration6/decoration6.component';
import { Decoration8Component } from '@ws/components/datav/decorations/decoration8/decoration8.component';
import { WsNavigationItem } from '@ws/components/navigation';
import { StorageService } from '@ws/services/storage';
import { WsTimeService } from '@ws/services/utils';
import { ConfigProvider } from 'app/core/config';
import { Navigation, NavigationService } from 'app/core/navigation';
import { QweatherService, WeatherNow } from 'app/core/platforms/qweather';
import { isUndefined } from 'lodash-es';
import { take, timer } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'ws-vis-header',
  templateUrl: './vis-header.component.html',
  styleUrls: ['./vis-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: wsAnimations,
  standalone: true,
  imports: [
    NgClass,
    RouterLink,
    TranslocoModule,
    Decoration3Component,
    Decoration5Component,
    Decoration6Component,
    Decoration8Component,
    Decoration10Component,
  ],
})
export class WsVisHeaderComponent implements OnInit {
  /** 导航数据 */
  navigationItems: WsNavigationItem[] = [];
  /** 激活路由 */
  activatedRouter: Router;
  /** 实时天气 */
  weatherNow: WeatherNow;
  /** 系统日期时间 */
  lastDateTime: string;

  /**
   * 构造函数
   */
  constructor(
    @Inject(WA_GEOLOCATION_SUPPORT) private _geolocationSupport: boolean,
    private _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private _wsTimeService: WsTimeService,
    private _storageService: StorageService,
    private _navigationService: NavigationService,
    private _qweatherService: QweatherService,
    private _permissions: PermissionsService,
    private _geolocation$: GeolocationService,
    public configProvider: ConfigProvider,
  ) {
    this.weatherNow = this._storageService.get<WeatherNow>('weather-now');
  }

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    this._permissions
      .state('geolocation')
      .pipe(take(1), untilDestroyed(this))
      .subscribe((geolocationStatus: PermissionState) => {
        if (this._geolocationSupport && geolocationStatus === 'prompt') {
          this._geolocation$.pipe(take(1), untilDestroyed(this)).subscribe(position => console.log(position.coords));
        }
      });

    // 实时天气处理
    timer(0, 60 * 10 * 1000)
      .pipe(untilDestroyed(this))
      .subscribe(() => this.weatherNowHandle());

    // 系统实时时间
    timer(0, 1000)
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.lastDateTime = this._wsTimeService.lastDateTime;
        // 检测变更
        this._changeDetectorRef.markForCheck();
      });

    // 订阅导航数据
    this._navigationService.navigation$.pipe(untilDestroyed(this)).subscribe((navigation: Navigation) => {
      this.navigationItems = navigation.default;
    });

    this.activatedRouter = this._router;
  }

  /**
   * 实时天气处理
   */
  weatherNowHandle(): void {
    // 数据观测时间
    const obsTime = this.weatherNow?.obsTime;
    if (!isUndefined(obsTime)) {
      const obsTimeDate = this._wsTimeService.parseISO(obsTime);
      const diffMinutes = this._wsTimeService.diffInMinutes(new Date(), obsTimeDate);

      // 如果数据观测时间小于10分钟则不更新
      if (diffMinutes < 10) return;
    }

    // 获取城市实时天气
    this._qweatherService.weatherNow({}).subscribe(result => {
      this.weatherNow = result.now;
      this.weatherNow.temp = `温度：${this.weatherNow.temp}℃`;
      this.weatherNow.humidity = `湿度：${this.weatherNow.humidity}%`;
      this.weatherNow.windDir = `${this.weatherNow.windDir}${this.weatherNow.windScale}级`;

      if (result.code == '200') {
        this._storageService.set('weather-now', this.weatherNow);
      } else {
        this.weatherNow = null;
      }
    });
  }
}
