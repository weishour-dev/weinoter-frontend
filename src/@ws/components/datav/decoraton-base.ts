import { Directive, inject, Input, OnInit } from '@angular/core';
import { fade } from '@jiaminghi/color';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AutoResize } from '@ws/components/datav/auto-size';
import { WsConfigService } from '@ws/services/config';
import { WsConfig } from 'app/core/config';
import { find } from 'lodash-es';

@UntilDestroy()
@Directive({
  host: {
    '[class]': "'block h-full w-full dv-decoration-'+decorationNum",
  },
  standalone: true,
})
export abstract class DecorationBase extends AutoResize implements OnInit {
  private _wsConfigService = inject(WsConfigService);

  @Input() set colors(colorArr: string[]) {
    this.mergeColor(colorArr);
  }

  _colors: string[] = [];
  abstract decorationNum: number;
  abstract defaultColor: string[];
  themeColor: string;

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

      switch (this.decorationNum) {
        case 1:
          this._colors = ['var(--ws-primary-300)', 'var(--ws-primary-400)'];
          break;
        case 2:
          this._colors = [this.themeColor, 'var(--ws-primary-300)'];
          break;
        case 3:
          this._colors = ['var(--ws-primary-400)', 'transparent'];
          break;
        case 4:
          this._colors = [this.themeColor, 'var(--ws-primary-400)'];
          break;
        case 11:
          this._colors = [fade(this.themeColor, 50), this.themeColor];
          break;
        case 5:
        case 7:
        case 8:
          this._colors = [this.themeColor, this.themeColor];
          break;
        case 6:
          this._colors = [this.themeColor, 'var(--ws-primary-300)'];
          break;
        case 10:
          this._colors = [this.themeColor, fade(this.themeColor, 30)];
          break;
      }

      if (this.onTheme && typeof this.onTheme === 'function') this.onTheme();
    });
  }

  onTheme() {
    this.cdRef.detectChanges();
  }

  randomExtend(minNum: number, maxNum: number) {
    if (arguments.length === 1) {
      return parseInt((Math.random() * minNum + 1).toString());
    } else {
      return parseInt((Math.random() * (maxNum - minNum + 1) + minNum).toString());
    }
  }

  // ----------------------------------------------------------------------------
  // @ 私有方法
  // ----------------------------------------------------------------------------

  /**
   * 合并颜色配置
   */
  private mergeColor(colors: string[]) {
    const len1 = colors.length;
    const len2 = this.defaultColor.length;
    if (len1 >= len2) {
      this._colors = [...colors];
    } else {
      this._colors = [...colors, ...this.defaultColor.slice(len1)];
    }
  }
}
