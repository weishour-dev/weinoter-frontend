import { Injectable } from '@angular/core';
import { WsTimeService } from '@ws/services/utils';

@Injectable({ providedIn: 'root' })
export class DateRangePickerProvider {
  constructor(private _wsTimeService: WsTimeService) {}

  /** 昨天 */
  readonly yesterday: Date = this._wsTimeService.yesterday;

  /** 今天 */
  readonly today: Date = this._wsTimeService.today;

  /** 明天 */
  readonly tomorrow: Date = this._wsTimeService.tomorrow;

  /** 这周开始 */
  readonly weekStart: Date = this._wsTimeService.weekStart;

  /** 这月开始 */
  readonly monthStart: Date = this._wsTimeService.monthStart;

  /** 这月结束 */
  readonly monthEnd: Date = this._wsTimeService.monthEnd;

  /** 上月开始 */
  readonly lastMonthStart: Date = this._wsTimeService.lastMonthStart;

  /** 上月结束 */
  readonly lastMonthEnd: Date = this._wsTimeService.lastMonthEnd;

  /** 昨天 */
  readonly default: Date[] = [this.today, this.tomorrow];
}
