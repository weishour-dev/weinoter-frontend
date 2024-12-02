import { BooleanInput } from '@angular/cdk/coercion';
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WsNavigationItem, WsNavigationService } from '@ws/components/navigation';
import { WsVerticalNavigationComponent } from '@ws/components/navigation/vertical';
import { WsVerticalNavigationBasicItemComponent } from '@ws/components/navigation/vertical/components/basic';
import { WsVerticalNavigationCollapsableItemComponent } from '@ws/components/navigation/vertical/components/collapsable';
import { WsVerticalNavigationDividerItemComponent } from '@ws/components/navigation/vertical/components/divider';
import { WsVerticalNavigationSpacerItemComponent } from '@ws/components/navigation/vertical/components/spacer';

@UntilDestroy()
@Component({
  selector: 'ws-vertical-navigation-group-item',
  templateUrl: './group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgClass,
    MatIconModule,
    MatTooltipModule,
    WsVerticalNavigationBasicItemComponent,
    WsVerticalNavigationCollapsableItemComponent,
    WsVerticalNavigationDividerItemComponent,
    forwardRef(() => WsVerticalNavigationGroupItemComponent),
    WsVerticalNavigationSpacerItemComponent,
  ],
})
export class WsVerticalNavigationGroupItemComponent implements OnInit {
  static ngAcceptInputType_autoCollapse: BooleanInput;

  @Input() autoCollapse: boolean;
  @Input() item: WsNavigationItem;
  @Input() name: string;

  private _wsVerticalNavigationComponent: WsVerticalNavigationComponent;

  /**
   * 构造函数
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _wsNavigationService: WsNavigationService,
  ) {}

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    // 获取父导航组件
    this._wsVerticalNavigationComponent = this._wsNavigationService.getComponent(this.name);

    // 在导航组件上订阅onRefreshed
    this._wsVerticalNavigationComponent.onRefreshed.pipe(untilDestroyed(this)).subscribe(() => {
      // 检测变更
      this._changeDetectorRef.markForCheck();
    });
  }
}
