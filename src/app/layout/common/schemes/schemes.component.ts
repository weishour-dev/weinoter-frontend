import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WsConfigService } from '@ws/services/config';
import { Scheme, schemes, WsConfig } from 'app/core/config';
import { DropDownModule } from 'ng-devui';

@UntilDestroy()
@Component({
  selector: 'schemes',
  templateUrl: './schemes.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'schemes',
  standalone: true,
  imports: [NgTemplateOutlet, MatIconModule, MatButtonModule, DropDownModule, TranslocoModule],
})
export class SchemesComponent implements OnInit {
  availableSchemes: typeof schemes;
  activeScheme: string;
  iconCodes: Record<Scheme, string>;

  /**
   * 构造函数
   */
  constructor(private _wsConfigService: WsConfigService) {}

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    // 外观选项
    this.availableSchemes = schemes;

    // 订阅外观配置更改
    this._wsConfigService.config$.pipe(untilDestroyed(this)).subscribe((config: WsConfig) => {
      // 存储配置
      this.activeScheme = config.scheme;
    });

    // 设置外观图标代码
    this.iconCodes = {
      auto: 'mat_solid:brightness_auto',
      dark: 'heroicons_solid:moon',
      light: 'heroicons_solid:sun',
    };
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 设置外观
   *
   * @param scheme
   */
  setActiveScheme(scheme: string): void {
    this._wsConfigService.config = { scheme };
  }

  /**
   * 下拉状态
   *
   * @param event
   */
  onToggle(event: boolean): void {}
}
