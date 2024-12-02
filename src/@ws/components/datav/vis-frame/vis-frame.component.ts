import { DOCUMENT, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  OnInit,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { addClass, removeClass, select } from '@syncfusion/ej2-base';
import { wsAnimations } from '@ws/animations';
import { WsStarBgComponent } from '@ws/components/datav/star-bg/star-bg.component';
import { WsVisHeaderComponent } from '@ws/components/datav/vis-header/vis-header.component';
import { ConfigProvider } from 'app/core/config';
import { isNull } from 'lodash-es';
import { FullscreenModule } from 'ng-devui/fullscreen';
import { debounceTime, fromEvent } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'ws-vis-frame',
  templateUrl: './vis-frame.component.html',
  styleUrls: ['./vis-frame.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: wsAnimations,
  standalone: true,
  imports: [
    NgClass,
    TranslocoModule,
    FullscreenModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    WsStarBgComponent,
    WsVisHeaderComponent,
  ],
})
export class WsVisFrameComponent implements OnInit {
  /** 是否全屏 */
  isFullscreen = false;
  /** 全屏按钮icon */
  fullscreenIcon = 'feather:maximize';
  /** 全屏按钮tip */
  fullscreenTooltip = 'fullscreen';

  /**
   * 构造函数
   */
  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private _elementRef: ElementRef,
    private _renderer2: Renderer2,
    public configProvider: ConfigProvider,
  ) {}

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    // 订阅窗口调整大小事件
    fromEvent(window, 'resize')
      .pipe(untilDestroyed(this), debounceTime(150))
      .subscribe(() => {
        // this.visContentHeightHandle();
      });
  }

  // ----------------------------------------------------------------------------
  // @ 全屏处理
  // ----------------------------------------------------------------------------

  /**
   * 全屏切换后的回调
   */
  launchFullscreen({ isFullscreen }): void {
    this.isFullscreen = isFullscreen;
    if (!isFullscreen) {
      this.navigationHandle(false);
      this.fullscreenIcon = 'feather:maximize';
      this.fullscreenTooltip = 'fullscreen';
    } else {
      this.navigationHandle(true);
      this.fullscreenIcon = 'feather:minimize';
      this.fullscreenTooltip = 'fullscreen_exit';
    }
  }

  /**
   * 导航全屏处理
   */
  navigationHandle(isHidden: boolean) {
    const navigationDom = select('.ws-navigation', this._document);

    if (!isNull(navigationDom)) {
      if (isHidden) {
        addClass([navigationDom], 'hidden');
      } else {
        removeClass([navigationDom], 'hidden');
      }
    }

    // this.visContentHeightHandle();
  }

  /**
   * 大屏内容高度处理
   */
  visContentHeightHandle() {
    const visContentDom = select('.vis-container .vis-content', this._document);
    const maxHeight = this._elementRef.nativeElement.clientHeight;
    console.log(maxHeight);

    if (!isNull(visContentDom)) this._renderer2.setStyle(visContentDom, 'height', `${maxHeight - 96}px`);
  }
}
