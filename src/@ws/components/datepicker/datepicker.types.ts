import { DevuiSelectOptions } from '@ws/types/devui';

export type StringNumber = string | number;
export type Dates = Date | Date[];

/** 日期分类数据 */
export const DateTypeItems: DevuiSelectOptions[] = [
  {
    value: 'minute',
    title: '分钟',
  },
  {
    value: 'hour',
    title: '小时',
  },
  {
    value: 'day',
    title: '天数',
  },
];

export interface ShortcutTime {
  active?: boolean;
  title: string;
  startDayType: string;
  startTimeText: string;
  endDayType: string;
  endTimeText: string;
}

export interface WsDatepickerOption {
  dateTimeType: string;
  dateNumber: number;
  dateType: string;
  dateTimeRange: string[];
  shortcutTime: ShortcutTime;
}
