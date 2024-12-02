import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WsConfigService } from '@ws/services/config';
import { WsMediaWatcherService } from '@ws/services/media-watcher';
import { ECharts, getInstanceByDom } from 'echarts';
import { NgxEchartsDirective } from 'ngx-echarts';
import { combineLatest, map } from 'rxjs';

@UntilDestroy()
@Directive({
  selector: '[wsEcharts]',
  exportAs: 'wsEcharts',
  standalone: true,
})
export class WsEchartsDirective implements AfterViewInit {
  @Input() ngxEcharts: NgxEchartsDirective;

  /** 图表实例 */
  chartInstance: ECharts;
  /** 是否暗黑 */
  isDark: boolean;

  /**
   * 构造函数
   */
  constructor(
    private _elementRef: ElementRef,
    private _wsConfigService: WsConfigService,
    private _wsMediaWatcherService: WsMediaWatcherService,
  ) {}

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 视图初始化后
   */
  ngAfterViewInit(): void {
    // 根据配置情况设置主题和方案
    combineLatest([
      this._wsConfigService.config$,
      this._wsMediaWatcherService.onMediaQueryChange$([
        '(prefers-color-scheme: dark)',
        '(prefers-color-scheme: light)',
      ]),
    ])
      .pipe(
        untilDestroyed(this),
        map(([config, mql]) => {
          const options = { scheme: config.scheme };

          // 如果方案设置为“自动”
          if (config.scheme === 'auto') {
            // 使用媒体查询决定方案
            options.scheme = mql.breakpoints['(prefers-color-scheme: dark)'] ? 'dark' : 'light';
          }

          return options;
        }),
      )
      .subscribe(options => {
        this.isDark = options.scheme === 'dark';

        if (!this.chartInstance) {
          setTimeout(() => {
            this.chartInstance = getInstanceByDom(this._elementRef.nativeElement);
            this.themeHandle();
          }, 1);
        } else {
          this.themeHandle();
        }
      });
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 主题处理
   */
  themeHandle(): void {
    this.ngxEcharts.theme = this.isDark ? 'dark' : 'customed';
    this.ngxEcharts.refreshChart();
  }
}
