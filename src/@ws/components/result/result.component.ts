import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { wsAnimations } from '@ws/animations';
import { WsPlayerComponent } from '@ws/components/player';
import { WsScrollbarDirective } from '@ws/directives/scrollbar';
import { ConfigProvider, errorNotData } from 'app/core/config';

@Component({
  selector: 'ws-result',
  templateUrl: './result.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: wsAnimations,
  standalone: true,
  imports: [NgClass, RouterLink, WsScrollbarDirective, WsPlayerComponent, TranslocoModule],
})
export class WsResultComponent implements OnInit {
  /** 模版 */
  @Input() template: 'default' | 'side' = 'default';

  /** 模版样式 */
  @Input() class: string;

  /** 播放路径 */
  @Input() src = errorNotData;

  /** 标题 */
  @Input() title = '';

  /** 按钮地址 */
  @Input() actionLink = '';

  /** 按钮名称 */
  @Input() actionText = '';

  /** 按钮点击事件 */
  @Output() readonly buttonClick: EventEmitter<void> = new EventEmitter<void>();

  /**
   * 构造函数
   */
  constructor(
    public configProvider: ConfigProvider,
    private _router: Router,
  ) {}

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    if (this.actionLink === '') this.actionLink = this._router.url;
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 按钮点击事件
   */
  resultButtonClick = () => {
    // 执行可观察对象
    this.buttonClick.next();
  };
}
