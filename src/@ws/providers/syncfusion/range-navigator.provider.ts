import { Injectable } from '@angular/core';
import {
  BorderModel,
  FontModel,
  MajorTickLinesModel,
  RangeNavigatorComponent,
  RangeNavigatorSeriesModel,
  RangeTooltipSettingsModel,
} from '@syncfusion/ej2-angular-charts';
import { DeviceChart } from 'app/core/monitoring';
import { assign } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class RangeNavigatorProvider {
  /** 默认边框样式 */
  readonly defaultBorder: BorderModel = {
    color: '',
    width: 1,
  };

  /** 默认字体样式 */
  readonly defaultFont: FontModel = {
    fontStyle: 'Normal',
    size: '16px',
    fontWeight: 'Normal',
    color: '',
    textAlignment: 'Center',
    fontFamily: '',
    opacity: 1,
    textOverflow: 'Trim',
  };

  /** 用于自定义范围导航标签的样式 */
  readonly labelStyle: FontModel = assign({}, this.defaultFont, {
    size: '14px',
    color: 'var(--ws-text-default)',
  });

  /** 用于自定义范围导航主要航线的样式 */
  readonly majorTickLines: MajorTickLinesModel = {
    width: 0,
    height: 5,
    color: null,
  };

  /** 自定义范围导航工具提示的选项 */
  readonly tooltip: RangeTooltipSettingsModel = {
    enable: true,
    opacity: 0.85,
    fill: null,
    format: 'dd日HH:mm:ss',
    textStyle: assign({}, this.defaultFont, { size: '14px' }),
    template: null,
    border: assign({}, this.defaultBorder, { width: 0 }),
    displayMode: 'Always',
  };

  /**
   * 范围导航默认设置
   *
   * @param rangeNavigatorInstance
   */
  defaultHandle(rangeNavigatorInstance: RangeNavigatorComponent): void {
    rangeNavigatorInstance.width = '100%';
    rangeNavigatorInstance.height = '80px';
    rangeNavigatorInstance.background = 'transparent';
    rangeNavigatorInstance.valueType = 'DateTime';
    rangeNavigatorInstance.majorTickLines = this.majorTickLines;
    rangeNavigatorInstance.labelStyle = this.labelStyle;
    rangeNavigatorInstance.tooltip = this.tooltip;
  }

  /**
   * 范围导航中系列的配置
   *
   * @param rangeNavigatorInstance
   * @param deviceCharts
   */
  seriesHandle(rangeNavigatorInstance: RangeNavigatorComponent, deviceCharts: DeviceChart[]): void {
    const series: RangeNavigatorSeriesModel[] = [];

    for (const deviceChart of deviceCharts) {
      series.push({
        dataSource: deviceChart.points,
        type: 'Line',
        xName: 'x',
        yName: 'y',
        width: 2,
      });
    }

    rangeNavigatorInstance.series = series;

    const points = deviceCharts[0].points;
    rangeNavigatorInstance.value = [new Date(points[0]?.x), new Date(points[points.length - 1]?.x)];
  }
}
