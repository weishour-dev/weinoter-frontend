import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { isNullOrUndefined } from '@syncfusion/ej2-base';

@Component({
  selector: 'ws-transloco',
  templateUrl: './transloco.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule],
})
export class WsTranslocoComponent implements OnInit {
  /** 范围 */
  @Input() scope: string;

  /** 国际化 */
  @Input() translation: string;

  /** 默认文本 */
  @Input() title: string;

  /**
   * 构造函数
   */
  constructor(private _translocoService: TranslocoService) {}

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    // 翻译的键处理
    if (!isNullOrUndefined(this.scope) && !isNullOrUndefined(this.translation) && this.translation !== '') {
      this.translation = `${this.scope}.${this.translation}`;
    }

    // 默认文本翻译
    if (isNullOrUndefined(this.title) && !isNullOrUndefined(this.translation)) {
      setTimeout(() => (this.title = this._translocoService.translate(this.translation)), 100);
    }
  }
}
