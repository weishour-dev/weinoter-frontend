export type ChartType = string | 'line' | 'bar';

export interface ChartLineData {
  dateRanges: string[];
  variableDatas: { code: number; name: string; values: number[] }[];
}

export interface ChartBarData {
  dateRangeDatas: Array<string | number>;
  variableDatas: { code: number; name: string; field: string; dateType: string }[];
}
