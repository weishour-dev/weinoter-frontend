import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WsListComponent } from '@ws/components/list';
import { WsScrollbarDirective } from '@ws/directives/scrollbar';
import { MapToPipe, ParseFromPipe } from '@ws/pipes';
import { WsTimeService } from '@ws/services/utils';
import type { SafeAny } from '@ws/types';
import { DevuiSelectOptions } from '@ws/types/devui';
import {
  ButtonModule,
  DatepickerProCalendarComponent,
  DatepickerProModule,
  DropDownModule,
  InputNumberModule,
  SelectModule,
  TabsModule,
} from 'ng-devui';
import { Dates, DateTypeItems, ShortcutTime, StringNumber } from './datepicker.types';

@Component({
  selector: 'ws-datepicker',
  templateUrl: './datepicker.component.html',
  styles: [
    `
      .shortcut-content {
        width: 172px;
        height: 306px;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ParseFromPipe,
    WsScrollbarDirective,
    WsListComponent,
    TabsModule,
    DropDownModule,
    InputNumberModule,
    SelectModule,
    ButtonModule,
    DatepickerProModule,
  ],
})
export class WsDatepickerComponent implements OnChanges {
  @Input() dateTime = '';
  @Output() readonly dateTimeChange: EventEmitter<string> = new EventEmitter<string>();
  @Input() dateTimeRange: string[] = [];
  @Output() readonly dateTimeRangeChange: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Input() dateTimeIsOpen = false;
  @Input() dateTimeType: string | number = 'relative_time';
  /** 相对时间 */
  @ViewChild('dateInputNumber', { read: ElementRef }) dateInputNumber: ElementRef<HTMLElement>;
  @ViewChild('dateSelect', { read: ElementRef }) dateSelect: ElementRef<HTMLElement>;
  @Input() dateNumber = 1;
  @Output() readonly dateNumberChange: EventEmitter<number> = new EventEmitter<number>();
  dateNumberMax = 23;
  @Input() dateType = 'hour';
  @Output() readonly dateTypeChange: EventEmitter<string> = new EventEmitter<string>();
  /** 日期分类数据 */
  dateTypeItems = DateTypeItems;
  /** 时间范围 */
  @ViewChild('calendar') calendar: DatepickerProCalendarComponent;
  @Input() absoluteTime: Date[] = [];
  /** 快捷列表数据 */
  @Input() shortcutSource: ShortcutTime[] = [];
  @Input() shortcutTime: ShortcutTime;
  @Output() readonly shortcutTimeChange: EventEmitter<ShortcutTime> = new EventEmitter<ShortcutTime>();

  /** 时间面板展开切换事件 */
  @Output() readonly panelOnToggle: EventEmitter<boolean> = new EventEmitter<boolean>();
  /** 时间分类切换事件 */
  @Output() readonly dateTimeTypeChange: EventEmitter<StringNumber> = new EventEmitter<StringNumber>();
  /** 相对时间分类切换事件 */
  @Output() readonly relativeTypeChange: EventEmitter<DevuiSelectOptions> = new EventEmitter<DevuiSelectOptions>();
  /** 相对时间确定事件 */
  @Output() readonly relativeConfirm: EventEmitter<string[]> = new EventEmitter<string[]>();
  /** 快捷切换更改后发出的事件 */
  @Output() readonly shortcutItemChange: EventEmitter<SafeAny> = new EventEmitter<SafeAny>();
  /** 时间范围确定事件 */
  @Output() readonly absoluteConfirm: EventEmitter<Dates> = new EventEmitter<Dates>();
  /** 时间范围取消事件 */
  @Output() readonly absoluteCancel: EventEmitter<void> = new EventEmitter<void>();
  /** 确定事件 */
  @Output() readonly confirm: EventEmitter<string[]> = new EventEmitter<string[]>();

  /**
   * 构造函数
   */
  constructor(private _wsTimeService: WsTimeService) {}

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 绑定输入改变
   *
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    // 时间显示字符串
    if ('dateTime' in changes) {
      // 执行可观察对象
      this.dateTimeChange.next(changes.dateTime.currentValue);
    }

    // 时间字符串数组
    if ('dateTimeRange' in changes) {
      if (this.dateTimeRange.length === 2) {
        this.dateTime = this.dateTimeRange.join(' - ');
        this.absoluteTime = [new Date(this.dateTimeRange[0]), new Date(this.dateTimeRange[1])];
      } else {
        this.dateTime = '';
        this.absoluteTime = [];
      }

      // 执行可观察对象
      this.dateTimeRangeChange.next(changes.dateTimeRange.currentValue);
    }

    // 时间分类
    if ('dateTimeType' in changes) {
      // 执行可观察对象
      this.dateTimeTypeChange.next(changes.dateTimeType.currentValue);
    }

    // 相对时间数值
    if ('dateNumber' in changes) {
      // 执行可观察对象
      this.dateNumberChange.next(changes.dateNumber.currentValue);
    }

    // 相对时间类别
    if ('dateType' in changes) {
      // 执行可观察对象
      this.dateTypeChange.next(changes.dateType.currentValue);
    }

    // 快捷时间选项
    if ('shortcutTime' in changes) {
      // 执行可观察对象
      this.shortcutTimeChange.next(changes.shortcutTime.currentValue);
    }
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 时间面板展开切换事件
   *
   * @param event
   */
  datepickerPanelOnToggle = (event: boolean) => {
    this.dateTimeIsOpen = event;
    if (event) this._updateCurPosition();

    // 执行可观察对象
    this.panelOnToggle.next(event);
  };

  /**
   * 时间分类切换事件
   *
   * @param event
   */
  datepickerTypeChange = (event: StringNumber) => {
    this._updateCurPosition();

    // 执行可观察对象
    this.dateTimeTypeChange.next(event);
  };

  /**
   * 相对时间数字改变事件
   *
   * @param value
   */
  datepickerRelativeNumberChange = (value: number) => {
    // 执行可观察对象
    this.dateNumberChange.next(value);
  };

  /**
   * 相对时间分类切换事件
   *
   * @param option
   */
  datepickerRelativeTypeChange = (option: DevuiSelectOptions) => {
    this.dateType = new MapToPipe().transform(option, 'value');
    // 执行可观察对象
    this.dateTypeChange.next(this.dateType);

    switch (this.dateType) {
      case 'minute':
        this.dateNumberMax = 59;
        break;
      case 'hour':
        this.dateNumberMax = 23;
        break;
      case 'day':
        this.dateNumberMax = 30;
        break;
    }

    // dateNumber重新验证
    const dataNumberInput = this.dateInputNumber.nativeElement.querySelector<HTMLElement>('input');
    dataNumberInput?.focus();

    const dataTypeInput = this.dateSelect.nativeElement.querySelector<HTMLElement>('input');
    setTimeout(() => dataTypeInput?.focus());

    // 执行可观察对象
    this.relativeTypeChange.next(option);
  };

  /**
   * 相对时间确定事件
   *
   * @param event
   */
  datepickerRelativeConfirm = (event: MouseEvent) => {
    this._dateTimeHandle();

    this.dateTimeIsOpen = false;

    // 执行可观察对象
    this.relativeConfirm.next(this.dateTimeRange);
    this.confirm.next(this.dateTimeRange);
  };

  /**
   * 时间范围改变事件
   *
   * @param value
   */
  datepickerAbsoluteChange = (value: Date[]) => {
    this.absoluteTime = value;

    // 快捷选项处理
    this.shortcutTime = undefined;
    this.shortcutSource = this.shortcutSource.map(shortcutTime => {
      shortcutTime.active = false;
      return shortcutTime;
    });

    // 执行可观察对象
    this.shortcutTimeChange.next(this.shortcutTime);
  };

  /**
   * 快捷切换更改后发出的事件
   *
   * @param event
   */
  datepickerShortcutItemChange(event: SafeAny): void {
    this.shortcutTime = event;

    const startDate =
      event.startDayType === 'today'
        ? this._wsTimeService.todayDateToString
        : this._wsTimeService.yesterdayDateToString;
    const endDate =
      event.endDayType === 'today' ? this._wsTimeService.todayDateToString : this._wsTimeService.yesterdayDateToString;

    this.dateTimeRange = [`${startDate} ${event.startTimeText}`, `${endDate} ${event.endTimeText}`];
    this.absoluteTime = [new Date(this.dateTimeRange[0]), new Date(this.dateTimeRange[1])];

    // 聚焦于InputEndElement
    setTimeout(() => {
      const datepickerInputEndElement = this.calendar.datepickerInputEnd.nativeElement;
      datepickerInputEndElement?.click();
    });

    // 执行可观察对象
    this.shortcutTimeChange.next(this.shortcutTime);
    this.shortcutItemChange.next(event);
  }

  /**
   * 时间范围确定事件
   *
   * @param value
   */
  datepickerAbsoluteConfirm = (value: Dates) => {
    this._dateTimeHandle();

    this.dateTimeIsOpen = false;

    // 执行可观察对象
    this.absoluteConfirm.next(value);
    this.confirm.next(this.dateTimeRange);
  };

  /**
   * 时间范围取消事件
   */
  datepickerAbsoluteCancel = () => {
    this.dateTimeIsOpen = false;

    // 执行可观察对象
    this.absoluteCancel.next();
  };

  // ----------------------------------------------------------------------------
  // @ 私有方法
  // ----------------------------------------------------------------------------

  /**
   * 更新日历面板位置
   */
  private _updateCurPosition(): void {
    if (this.dateTimeType === 'absolute_time' && this.calendar) this.calendar.updateCurPosition();
  }

  /**
   * 时间筛选处理
   */
  private _dateTimeHandle(): void {
    switch (this.dateTimeType) {
      case 'relative_time':
        this.dateTimeRange = this._wsTimeService.getLastDateRange(this.dateType, this.dateNumber);
        this.absoluteTime = [new Date(this.dateTimeRange[0]), new Date(this.dateTimeRange[1])];
        break;
      case 'absolute_time':
        if (this.absoluteTime.length !== 2) return;

        const startTime = this._wsTimeService.dateFormat(this.absoluteTime[0]);
        const endTime = this._wsTimeService.dateFormat(this.absoluteTime[1]);
        this.dateTimeRange = [startTime, endTime];
        break;
    }

    this.dateTime = this.dateTimeRange.join(' - ');

    // 执行可观察对象
    this.dateTimeChange.next(this.dateTime);
    this.dateTimeRangeChange.next(this.dateTimeRange);
  }
}
