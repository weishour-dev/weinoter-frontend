import { Injectable } from '@angular/core';
import { ChartBarData } from '@ws/components/charts';
import { DevuiSelectOptions } from '@ws/types';
import { DatasetComponentOption, ECharts, EChartsOption, LegendComponentOption, SeriesOption } from 'echarts';

@Injectable({ providedIn: 'root' })
export class EchartsBarProvider {
  /** 默认图例配置 */
  readonly defaultLegend: LegendComponentOption = {
    selectedMode: 'multiple',
  };

  /** 默认系列配置 */
  readonly defaultSerie: SeriesOption = {
    type: 'bar',
    emphasis: { focus: 'series' },
    markLine: {
      data: [{ type: 'average', name: 'Avg' }],
    },
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
      right: '50',
      bottom: '60',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      showDelay: 1,
      confine: true,
      axisPointer: {
        type: 'shadow',
        snap: true,
      },
      className: 'z-10',
    },
    legend: this.defaultLegend,
    yAxis: {},
    xAxis: {
      type: 'category',
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
  loadHandle(chartInstance: ECharts, option: EChartsOption, data: ChartBarData): EChartsOption {
    const series: SeriesOption[] = [];
    const dataset: DatasetComponentOption = {};
    const dateRangeDatas = data.dateRangeDatas;
    const variableDatas = data.variableDatas;

    const firstDimension = ['dataRange'];
    for (const variableData of variableDatas) {
      series.push(this.defaultSerie);
      firstDimension.push(variableData.name);
    }

    const datasetSource = [firstDimension, ...dateRangeDatas];
    dataset.source = datasetSource;

    option.dataset = dataset;
    option.series = series;
    chartInstance.setOption(option, { replaceMerge: ['dataset', 'series'] });

    return <EChartsOption>chartInstance.getOption();
  }
}
