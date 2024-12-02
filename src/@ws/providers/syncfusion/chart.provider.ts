import { Injectable } from '@angular/core';
import {
  AxisModel,
  BorderModel,
  ChartAreaModel,
  ChartComponent,
  CrosshairSettingsModel,
  FontModel,
  LegendSettingsModel,
  MarkerSettingsModel,
  SeriesModel,
  TooltipSettingsModel,
  ZoomSettingsModel,
} from '@syncfusion/ej2-angular-charts';
import { Internationalization } from '@syncfusion/ej2-base';
import { BarVariableDatas, ChartBarData, DeviceChart } from 'app/core/monitoring';
import { Decimal } from 'decimal.js';
import { assign, findIndex, isNaN, startsWith } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class ChartProvider {
  //#region 其他
  intl: Internationalization = new Internationalization();
  nFormatter = this.intl.getNumberFormat({ format: '########.##' });
  //#endregion

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

  /** 用于自定义图表标题的选项 */
  readonly titleStyle: FontModel = assign({}, this.defaultFont, {
    color: 'var(--ws-text-default)',
  });

  /** 用于配置图表区域的边框和背景的选项 */
  readonly chartArea: ChartAreaModel = {
    border: assign({}, this.defaultBorder, { width: 0 }),
    background: 'transparent',
    opacity: 1,
    backgroundImage: null,
    width: null,
  };

  /** 用于配置水平轴的选项 */
  readonly primaryXAxis: AxisModel = {
    labelStyle: assign({}, this.defaultFont, { size: '14px', color: 'var(--ws-text-default)' }),
    crosshairTooltip: {
      enable: false,
    },
    labelFormat: 'dd日HH:mm:ss',
    valueType: 'DateTime',
    intervalType: 'Seconds',
    majorGridLines: { width: 0 },
    edgeLabelPlacement: 'Shift',
  };

  /** 用于配置垂直轴的选项 */
  readonly primaryYAxis: AxisModel = {
    labelStyle: assign({}, this.defaultFont, { size: '14px', color: 'var(--ws-text-default)' }),
    lineStyle: { width: 0 },
    majorTickLines: { width: 0 },
    labelFormat: '{value}',
  };

  /** 用于自定义图表图例的选项 */
  readonly legendSettings: LegendSettingsModel = {
    visible: true,
    textStyle: assign({}, this.defaultFont, { size: '16px', color: 'var(--ws-text-default)' }),
  };

  /** 用于显示和自定义系列中各个点的标记的选项 */
  readonly marker: MarkerSettingsModel = {
    visible: false,
    shape: 'VerticalLine',
    imageUrl: '',
    height: 5,
    width: 5,
    border: this.defaultFont,
    fill: null,
    opacity: 1,
    dataLabel: {
      visible: false,
      font: assign({}, this.defaultFont, { size: '14px', color: 'var(--ws-text-default)' }),
    },
  };

  /** 自定义图表工具提示的选项 */
  readonly tooltip: TooltipSettingsModel = {
    enable: true,
    enableMarker: true,
    shared: true,
    fill: null,
    header: null,
    opacity: 0.75,
    textStyle: assign({}, this.defaultFont, { size: '14px' }),
    format: null,
    template: null,
    enableAnimation: true,
    duration: 300,
    fadeOutDuration: 1000,
    fadeOutMode: 'Move',
    enableTextWrap: false,
    border: assign({}, this.defaultBorder, { width: 0 }),
  };

  /** 用于自定义图表十字准线的选项 */
  readonly crosshair: CrosshairSettingsModel = {
    enable: true,
    dashArray: '',
    line: assign({}, this.defaultBorder),
    lineType: 'Vertical',
    verticalLineColor: '',
    horizontalLineColor: '',
    opacity: 1,
  };

  /** 在图表中启用缩放功能的选项 */
  readonly zoomSettings: ZoomSettingsModel = {
    enableSelectionZooming: false,
    enablePinchZooming: false,
    enableMouseWheelZooming: false,
    enableDeferredZooming: true,
    mode: 'X',
    enablePan: true,
    enableScrollbar: true,
  };

  /**
   * 图表默认设置
   *
   * @param chartInstance
   */
  defaultHandle(chartInstance: ChartComponent): void {
    chartInstance.width = '100%';

    chartInstance.titleStyle = this.titleStyle;
    chartInstance.tooltip = this.tooltip;

    chartInstance.chartArea = this.chartArea;
    chartInstance.primaryXAxis = this.primaryXAxis;
    chartInstance.primaryYAxis = this.primaryYAxis;
    chartInstance.legendSettings = this.legendSettings;

    /** 缩放 */
    chartInstance.zoomSettings = this.zoomSettings;
    chartInstance.primaryXAxis.enableAutoIntervalOnZooming = true;

    /** 十字准线 */
    chartInstance.crosshair = this.crosshair;

    /** 指定图表是否应该以Canvas模式渲染 */
    chartInstance.enableCanvas = false;
  }

  /**
   * 图表中系列的配置
   *
   * @param chartInstance
   * @param deviceCharts
   */
  seriesHandle(chartInstance: ChartComponent, deviceCharts: DeviceChart[]): void {
    const series: SeriesModel[] = [];

    for (const deviceChart of deviceCharts) {
      series.push({
        dataSource: deviceChart.points,
        type: 'Line',
        xName: 'x',
        yName: 'y',
        name: deviceChart.name,
        width: 2,
        marker: this.marker,
      });
    }

    chartInstance.series = series;
  }

  /**
   * 能耗图表数据处理
   *
   * @param chartData
   * @returns BarVariableDatas[]
   */
  chartDataEnergyHandle(chartData: ChartBarData): BarVariableDatas[] {
    const dateRangeDatas = chartData?.dateRangeDatas;
    const variableDatas = chartData?.variableDatas;
    const datas = [];

    if (dateRangeDatas.length === 1) {
      for (const variableData of variableDatas) {
        const index = findIndex(variableDatas, variableData) + 1;
        variableData['value'] = dateRangeDatas[0][index];
        datas.push(variableData);
      }
    }

    return datas;
  }

  /**
   * 使用率、利用率处理
   *
   * @param datas
   * @returns
   */
  timeRateHandle(datas: { name: string; value: number }[]): { start: number; use: number } {
    let start = 0;
    let use = 0;
    let activeTime = 0;
    let standTime = 0;
    let stopTime = 0;

    for (const data of datas) {
      if (startsWith(data.name, '运行时间')) {
        activeTime = +data.value;
      } else if (startsWith(data.name, '待机时间')) {
        standTime = +data.value;
      } else if (startsWith(data.name, '停机时间')) {
        stopTime = +data.value;
      }
    }

    // 使用率
    const startOriginal = (activeTime + standTime) / (activeTime + standTime + stopTime);
    start = +this.nFormatter(new Decimal(startOriginal).times(100).toNumber());

    // 利用率
    const useOriginal = activeTime / (activeTime + standTime + stopTime);
    use = +this.nFormatter(new Decimal(useOriginal).times(100).toNumber());

    return (isNaN(start) && isNaN(use)) || activeTime < 0 ? undefined : { start, use };
  }
}
