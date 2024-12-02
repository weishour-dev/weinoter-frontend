import { Injectable } from '@angular/core';
import {
  addDays,
  addHours,
  addMilliseconds,
  addMinutes,
  addMonths,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  format,
  getTime,
  lastDayOfMonth,
  lastDayOfWeek,
  parseISO,
  ParseISOOptions,
  startOfMinute,
  startOfMonth,
  startOfToday,
  startOfTomorrow,
  startOfWeek,
  startOfYesterday,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

@Injectable({ providedIn: 'root' })
export class WsTimeService {
  // ----------------------------------------------------------------------------
  // @ 访问器
  // ----------------------------------------------------------------------------

  /**
   * 获取当前时间戳
   */
  get TimeStamp(): number {
    return getTime(new Date());
  }

  /**
   * 获取当前日期 (YYYY-MM-DD)
   */
  get CurrentDate(): string {
    return format(new Date(), 'yyyy-MM-dd');
  }

  /**
   * 获取当前时间 (YYYY-MM-DD HH:mm:ss)
   */
  get CurrentTime(): string {
    return format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  }

  /** 昨天 */
  get yesterday(): Date {
    return startOfYesterday();
  }

  /** 昨天 ('yyyy-MM-dd') */
  get yesterdayDateToString(): string {
    return this.dateFormat(this.yesterday, 'yyyy-MM-dd');
  }

  /** 今天 */
  get today(): Date {
    return startOfToday();
  }

  /** 今天 ('yyyy-MM-dd') */
  get todayDateToString(): string {
    return this.dateFormat(this.today, 'yyyy-MM-dd');
  }

  /** 明天 */
  get tomorrow(): Date {
    return startOfTomorrow();
  }

  /** 本周开始 */
  get currentWeekStart(): Date {
    return startOfWeek(new Date(), { weekStartsOn: 1 });
  }

  /** 本周结束 */
  get currentWeekEnd(): Date {
    return addDays(this.currentWeekStart, 6);
  }

  /** 这周开始 */
  get weekStart(): Date {
    return startOfWeek(new Date(), { weekStartsOn: 1 });
  }

  /** 这周结束 */
  get weekEnd(): Date {
    return lastDayOfWeek(new Date(), { weekStartsOn: 1 });
  }

  /** 这月开始 */
  get monthStart(): Date {
    return startOfMonth(new Date());
  }

  /** 这月结束 */
  get monthEnd(): Date {
    return lastDayOfMonth(new Date());
  }

  /** 上月开始 */
  get lastMonthStart(): Date {
    return addMonths(this.monthStart, -1);
  }

  /** 上月结束 */
  get lastMonthEnd(): Date {
    return addMonths(this.monthEnd, -1);
  }

  /** 获取最新时间 */
  get lastDateTime(): string {
    const datetime = this.CurrentTime;
    const datetimeArray = datetime.split(' ');
    const dateArray = datetimeArray[0].split('-');
    const timeArray = datetimeArray[1].split(':');
    const datetimeText = `${dateArray[0]}年${dateArray[1]}月${dateArray[2]}日 ${timeArray[0]}时${timeArray[1]}分${timeArray[2]}秒`;
    return datetimeText;
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 获取时间戳
   *
   * @param fm
   * @returns
   */
  getTime = (fm?: string | number | Date): number => new Date(fm).getTime();

  /**
   * 时间格式化
   *
   * @param date
   * @param fm
   * @returns
   */
  dateFormat = (date: Date = new Date(), fm = 'yyyy-MM-dd HH:mm:ss') => format(date, fm, { locale: zhCN });

  /** 解析ISO */
  parseISO = (argument: string, options?: ParseISOOptions): Date => parseISO(argument, options);

  /**
   * 获取当前分钟时间 (YYYY-MM-DD HH:mm:ss)
   */
  getStartMinuteDate(date: Date = new Date()): string {
    return format(startOfMinute(date), 'yyyy-MM-dd HH:mm:ss');
  }

  /**
   * 获取最新的时间段
   *
   * @param type
   * @param num
   * @returns
   */
  getLastDateRange = (type = 'hour', num = 1) => {
    let startTime = '';
    const fm = 'yyyy-MM-dd HH:mm:ss';

    switch (type) {
      case 'minute':
        startTime = format(addMinutes(new Date(), -num), fm);
        break;
      case 'hour':
        startTime = format(addHours(new Date(), -num), fm);
        break;
      case 'day':
        startTime = format(addDays(new Date(), -num), fm);
        break;
    }

    return [startTime, this.CurrentTime];
  };

  /**
   * 获取时间分钟差
   *
   * @param dateLeft
   * @param dateRight
   * @returns
   */
  diffInMinutes = (dateLeft: number | Date, dateRight: number | Date) => differenceInMinutes(dateLeft, dateRight);

  /**
   * 获取相对天数日期
   *
   * @param date
   * @returns
   */
  addDays = (date: number | Date, amount: number) => addDays(date, amount);

  /**
   * 日期的分钟处理
   *
   * @param date
   * @param num
   * @returns
   */
  dateMinuteHandle = (date: string, num: number) => format(addMinutes(new Date(date), num), 'yyyy-MM-dd HH:mm:ss');

  /**
   * 毫秒计时处理
   *
   * @param date
   * @param num
   * @returns
   */
  stopwatchHandle = (millisecond: number, formatStr: string = 'mm:ss') =>
    format(addMilliseconds(new Date(0), millisecond), formatStr);

  /**
   * 获取两个时间差
   *
   * @param dateLeft {number | Date}
   * @param dateRight {number | Date}
   * @param type {string}
   */
  diffTime(dateLeft: number | Date, dateRight: number | Date, type: string = ''): string | number {
    const timediff = differenceInSeconds(dateRight, dateLeft);

    // 计算天数
    const days = timediff / 86400;
    // 计算小时数
    let remain = timediff % 86400;
    const hours = remain / 3600;
    // 计算分钟数
    remain = timediff % 3600;
    const mins = remain / 60;
    // 计算秒数
    const secs = remain % 60;

    if (type !== '') {
      switch (type) {
        case 'day':
          return days;
        case 'hour':
          return hours;
        case 'min':
          return mins;
        case 'sec':
          return timediff;
      }
    } else {
      if (days >= 1) {
        return `${differenceInDays(dateRight, dateLeft)}天`;
      } else if (hours >= 1) {
        return `${differenceInHours(dateRight, dateLeft)}小时`;
      } else if (mins >= 1) {
        return `${differenceInMinutes(dateRight, dateLeft)}分钟 ${secs}秒`;
      } else {
        return `${timediff}秒`;
      }
    }
  }
}
