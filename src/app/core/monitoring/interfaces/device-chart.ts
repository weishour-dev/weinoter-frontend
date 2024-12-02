export interface ChartLineData {
  dateRanges: string[];
  variableDatas: { code: number; name: string; values: number[] }[];
}

export interface ChartBarData {
  dateRangeDatas: Array<string | number>;
  variableDatas: BarVariableDatas[];
}

export interface BarVariableDatas {
  code: number;
  name: string;
  value?: string;
  field: string;
  dateType: string;
}

export interface DeviceChart {
  id: number;
  type: string;
  code: number;
  name: string;
  points: { x: string; y: number }[];
}
