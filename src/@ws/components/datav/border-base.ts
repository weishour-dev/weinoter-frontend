import { ChangeDetectorRef, Directive, ElementRef, inject, Input, OnInit } from '@angular/core';
import { fade } from '@jiaminghi/color';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AutoResize } from '@ws/components/datav/auto-size';
import { WsConfigService } from '@ws/services/config';
import { WsConfig } from 'app/core/config';
import { find } from 'lodash-es';

@UntilDestroy()
@Directive({
  host: {
    '[class]': "'block drop-shadow-md h-full w-full relative dv-border-box-'+borderBoxNum",
  },
})
export abstract class BorderBase extends AutoResize implements OnInit {
  private _wsConfigService = inject(WsConfigService);

  @Input() backgroundColor = 'transparent';
  @Input() set colors(colorArr: string[]) {
    this.mergeColor(colorArr);
  }
  _colors: string[] = [];
  abstract borderBoxNum: number;
  defaultColor = ['#4fd2dd', '#235fa7'];
  themeColor: string;

  /**
   * 构造函数
   */
  constructor(eleRef: ElementRef, cdRef: ChangeDetectorRef) {
    super(eleRef, cdRef);
  }

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    this.mergeColor(this._colors);

    // 订阅配置更改
    this._wsConfigService.config$.pipe(untilDestroyed(this)).subscribe((config: WsConfig) => {
      this.themeColor = find(config.themes, ['id', config.theme])?.color;

      switch (this.borderBoxNum) {
        case 1:
        case 12:
          this._colors = [fade(this.themeColor, 30), fade(this.themeColor, 80)];
          break;
        case 2:
          this._colors = [this.themeColor, 'var(--ws-primary-400)'];
          break;
        case 3:
          this._colors = [this.themeColor, fade(this.themeColor, 50)];
          break;
        case 4:
          this._colors = [this.themeColor, 'var(--ws-primary-400)'];
          break;
        case 5:
          this._colors = ['var(--ws-primary-400)', fade(this.themeColor, 80)];
          break;
        case 6:
        case 13:
          this._colors = [this.themeColor, 'var(--ws-primary-400)'];
          break;
        case 7:
        case 8:
        case 10:
          this._colors = [fade(this.themeColor, 30), this.themeColor];
          break;
      }

      if (this.onTheme && typeof this.onTheme === 'function') this.onTheme();
    });
  }

  nTos(num: number) {
    return String(num);
  }

  onTheme() {
    this.cdRef.detectChanges();
  }

  // ----------------------------------------------------------------------------
  // @ 私有方法
  // ----------------------------------------------------------------------------

  /**
   * 合并颜色配置
   */
  private mergeColor(colors: string[]) {
    this._colors = Object.assign(this.defaultColor, colors);
  }
}
