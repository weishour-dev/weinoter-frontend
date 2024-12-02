import { Injectable } from '@angular/core';
import { ChartLineData } from '@ws/components/charts';
import { DevuiSelectOptions } from '@ws/types';
import { ECharts, EChartsOption, LegendComponentOption, SeriesOption } from 'echarts';

@Injectable({ providedIn: 'root' })
export class EchartsLineProvider {
  /** 默认图例配置 */
  readonly defaultLegend: LegendComponentOption = {
    type: 'scroll',
    left: 0,
    padding: [5, 110, 5, 5],
    selectedMode: 'multiple',
  };

  /** 默认系列配置 */
  readonly defaultSerie: SeriesOption = {
    type: 'line',
    smooth: true,
    symbol: 'roundRect',
    showSymbol: false,
    connectNulls: false,
    emphasis: { focus: 'none' },
  };

  /** 图例默认选择模式 */
  readonly legendSelectMode = 'multiple';

  /** 图例选择模式选项 */
  readonly legendSelectedModes: DevuiSelectOptions[] = [
    { value: 'single', title: '图例单选' },
    { value: 'multiple', title: '图例多选' },
  ];

  /** 默认配置 */
  readonly defaultOption: EChartsOption = {
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: false,
        },
        restore: {},
        saveAsImage: {},
      },
    },
    grid: {
      left: '10',
      right: '10',
      bottom: '60',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      showDelay: 1,
      confine: true,
      axisPointer: {
        snap: true,
      },
      className: 'z-10',
    },
    legend: this.defaultLegend,
    yAxis: {
      type: 'value',
    },
    xAxis: {
      type: 'time',
      boundaryGap: [0, 0],
    },
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0],
        filterMode: 'empty',
      },
      {
        type: 'slider',
        xAxisIndex: [0],
        filterMode: 'empty',
      },
    ],
  };

  /**
   * 数据加载处理
   *
   * @param chartInstance
   * @param option
   * @param data
   */
  loadHandle(chartInstance: ECharts, option: EChartsOption, data: ChartLineData): EChartsOption {
    const series: SeriesOption[] = [];
    const dateRanges = data.dateRanges;
    const variableDatas = data.variableDatas;

    for (const variableData of variableDatas) {
      const name = variableData.name;
      const values = variableData.values;
      const data = [];

      // eslint-disable-next-line guard-for-in
      for (const key in values) {
        data.push([dateRanges[+key], values[+key]]);
      }

      series.push({ ...this.defaultSerie, name, data });
    }

    option.series = series;
    chartInstance.setOption(option, { replaceMerge: 'series' });

    return <EChartsOption>chartInstance.getOption();
  }
}
