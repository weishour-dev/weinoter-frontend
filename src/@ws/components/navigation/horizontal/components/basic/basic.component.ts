import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IsActiveMatchOptions, RouterModule } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WsNavigationItem, WsNavigationService } from '@ws/components/navigation';
import { WsHorizontalNavigationComponent } from '@ws/components/navigation/horizontal/horizontal.component';
import { WsTranslocoComponent } from '@ws/components/transloco';
import { WsUtilsService } from '@ws/services/utils/utils.service';

@UntilDestroy()
@Component({
  selector: 'ws-horizontal-navigation-basic-item',
  templateUrl: './basic.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgClass,
    NgTemplateOutlet,
    RouterModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    WsTranslocoComponent,
  ],
})
export class WsHorizontalNavigationBasicItemComponent implements OnInit {
  @Input() item: WsNavigationItem;
  @Input() name: string;

  isActiveMatchOptions: IsActiveMatchOptions;
  private _wsHorizontalNavigationComponent: WsHorizontalNavigationComponent;

  /**
   * 构造函数
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _wsNavigationService: WsNavigationService,
    private _wsUtilsService: WsUtilsService,
  ) {
    // 将等效{exact: false}设置为活动匹配选项的默认值。我们不分配项目。isActiveMatchOptions
    // 直接指向[routerLinkActiveOptions]，因为如果它一开始是"undefined"，路由器会抛出一个错
    // 误并停止工作.
    this.isActiveMatchOptions = this._wsUtilsService.subsetMatchOptions;
  }

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    // 从项目的“isActiveMatchOptions”或项目的“exactMatch”选项的等效形式设置“isActiveMatchOptions”
    this.isActiveMatchOptions =
      (this.item.isActiveMatchOptions ?? this.item.exactMatch)
        ? this._wsUtilsService.exactMatchOptions
        : this._wsUtilsService.subsetMatchOptions;

    // 获取父导航组件
    this._wsHorizontalNavigationComponent = this._wsNavigationService.getComponent(this.name);

    // 检测变更
    this._changeDetectorRef.markForCheck();

    // 在导航组件上订阅onRefreshed
    this._wsHorizontalNavigationComponent.onRefreshed.pipe(untilDestroyed(this)).subscribe(() => {
      // 检测变更
      this._changeDetectorRef.markForCheck();
    });
  }
}
