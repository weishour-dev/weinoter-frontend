import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'ws-player',
  templateUrl: './player.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WsPlayerComponent implements OnInit, AfterViewInit {
  @ViewChild('lottiePlayer', { read: ElementRef }) lottiePlayer: ElementRef;

  /** 播放路径 */
  @Input() src: string;

  /** 自动播放 */
  @Input() autoplay = true;

  /** 循环播放 */
  @Input() loop = false;

  /** 播放模式 */
  @Input() mode: 'normal' | 'bounce' = 'normal';

  /** 播放速度 */
  @Input() speed = 3;

  /** 背景颜色 */
  @Input() background = 'transparent';

  /** 宽度 */
  @Input() width = '100%';

  /** 高度 */
  @Input() height = '400px';

  /** 是否显示 */
  shouldShowLottie = true;

  /**
   * 构造函数
   */
  constructor(private _router: Router) {}

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    // 将监听器附加到NavigationEnd事件
    this._router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        untilDestroyed(this),
      )
      .subscribe(() => this.load());
  }

  /**
   * 视图初始化后
   */
  ngAfterViewInit(): void {
    setTimeout(() => this.load());
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 加载
   */
  load = () => {
    this.shouldShowLottie = false;
    setTimeout(() => (this.shouldShowLottie = true));
  };
}
