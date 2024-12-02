import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { EchartsBarProvider, EchartsLineProvider } from '@ws/providers';
import { WsConfigService } from '@ws/services/config';
import { WsMediaWatcherService } from '@ws/services/media-watcher';
// import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ECharts, EChartsOption, getInstanceByDom, LegendComponentOption } from 'echarts';
import { assign } from 'lodash-es';
import { NgxEchartsDirective, NgxEchartsModule, ThemeOption } from 'ngx-echarts';
import { ChartBarData, ChartLineData, ChartType } from './charts.types';

// @UntilDestroy()
@Component({
  selector: 'ws-charts',
  templateUrl: './charts.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgxEchartsModule],
})
export class WsChartsComponent implements OnChanges, OnInit, AfterViewInit {
  /** 图表类型 */
  @Input() type: ChartType = 'line';
  @Output() readonly typeChange: EventEmitter<string> = new EventEmitter<string>();

  /** 图表业务数据 */
  @Input() data: ChartLineData | ChartBarData;
  /** 图例选择模式 */
  @Input() legendSelectMode: string;

  /** 图表实例 */
  chartInstance: ECharts;

  /** 图表配置数据 */
  chartOption: EChartsOption;

  /** 图表主题 */
  theme: string | ThemeOption;

  /** 图表指令实例 */
  @ViewChild(NgxEchartsDirective) ngxEcharts: NgxEchartsDirective;

  /** 图表的Dom元素 */
  @ViewChild('chartDom') chartDom: ElementRef;

  /** 图表默认配置 */
  private defaultOption: EChartsOption;

  /** 默认图例配置 */
  private defaultLegend: LegendComponentOption;

  /**
   * 构造函数
   */
  constructor(
    private _wsConfigService: WsConfigService,
    private _wsMediaWatcherService: WsMediaWatcherService,
    private _echartsLineProvider: EchartsLineProvider,
    private _echartsBarProvider: EchartsBarProvider,
  ) {}

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 绑定输入改变
   *
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    // 图例选择模式
    if ('type' in changes) {
      switch (this.type) {
        case 'line':
          this.defaultOption = this._echartsLineProvider.defaultOption;
          this.defaultLegend = this._echartsLineProvider.defaultLegend;
          break;
        case 'bar':
          this.defaultOption = this._echartsBarProvider.defaultOption;
          this.defaultLegend = this._echartsBarProvider.defaultLegend;
          break;
      }

      // 图表配置
      this.chartOption = assign({}, this.defaultOption, {
        legend: {
          ...this.defaultLegend,
          selectedMode: this.legendSelectMode,
        },
      });

      // 执行可观察对象
      this.typeChange.next(changes.type.currentValue);
    }

    // 图表业务数据
    if ('data' in changes) {
      const data = changes.data.currentValue;

      if (data && this.chartInstance) {
        switch (this.type) {
          case 'line':
            this.chartOption = this._echartsLineProvider.loadHandle(
              this.chartInstance,
              assign({}, this.chartOption, {
                legend: {
                  ...this.defaultLegend,
                  selectedMode: this.legendSelectMode,
                },
              }),
              data,
            );
            break;
          case 'bar':
            this.chartOption = this._echartsBarProvider.loadHandle(
              this.chartInstance,
              assign({}, this.chartOption, {
                legend: {
                  ...this.defaultLegend,
                  selectedMode: this.legendSelectMode,
                },
              }),
              data,
            );
            break;
        }
      }
    }

    // 图例选择模式
    if ('legendSelectMode' in changes) {
      const selectedMode = changes.legendSelectMode.currentValue;
      this.chartInstance?.setOption(assign({}, this.chartOption, { legend: { selectedMode } }));
    }
  }

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    switch (this.type) {
      case 'line':
        this.defaultOption = this._echartsLineProvider.defaultOption;
        this.defaultLegend = this._echartsLineProvider.defaultLegend;
        break;
      case 'bar':
        this.defaultOption = this._echartsBarProvider.defaultOption;
        this.defaultLegend = this._echartsBarProvider.defaultLegend;
        break;
    }

    // 图表配置
    this.chartOption = assign({}, this.defaultOption, {
      legend: {
        ...this.defaultLegend,
        selectedMode: this.legendSelectMode,
      },
    });
  }

  /**
   * 视图初始化后
   */
  ngAfterViewInit(): void {
    // // 根据配置情况设置主题和方案
    // combineLatest([
    //   this._wsConfigService.config$,
    //   this._wsMediaWatcherService.onMediaQueryChange$([
    //     '(prefers-color-scheme: dark)',
    //     '(prefers-color-scheme: light)',
    //   ]),
    // ])
    //   .pipe(
    //     untilDestroyed(this),
    //     map(([config, mql]) => {
    //       const options = { scheme: config.scheme };

    //       // 如果方案设置为“自动”
    //       if (config.scheme === 'auto') {
    //         // 使用媒体查询决定方案
    //         options.scheme = mql.breakpoints['(prefers-color-scheme: dark)'] ? 'dark' : 'light';
    //       }

    //       return options;
    //     }),
    //   )
    //   .subscribe(options => {
    //     this.theme = options.scheme === 'dark' ? 'dark' : undefined;
    //     this.ngxEcharts.refreshChart();
    //   });

    setTimeout(() => {
      this.chartInstance = getInstanceByDom(this.chartDom.nativeElement);
    });
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------
}
