import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SafeAny } from '@ws/types';
import { ToggleModule } from 'ng-devui';

@Component({
  selector: 'ws-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [FormsModule, ToggleModule],
})
export class WsToggleComponent {
  /** 开关是否打开 */
  @Input() value: boolean;
  /** 开关切换事件 */
  @Output() readonly valueChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  /** 开关打开时文本 */
  @Input() checkedText = '启用';
  /** 开关关闭时文本 */
  @Input() uncheckedText = '禁用';

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 点击事件
   *
   * @param event
   */
  toggleOnClick(event: SafeAny): void {
    event.stopPropagation();
    event.preventDefault();
  }

  /**
   * 改变事件
   *
   * @param status
   */
  toggleOnChange(status: boolean): void {
    // 执行可观察对象
    this.valueChange.next(status);
  }
}
