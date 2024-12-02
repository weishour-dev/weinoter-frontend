import { BooleanInput } from '@angular/cdk/coercion';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WsNavigationItem, WsNavigationService } from '@ws/components/navigation';
import { WsHorizontalNavigationBasicItemComponent } from '@ws/components/navigation/horizontal/components/basic';
import { WsHorizontalNavigationDividerItemComponent } from '@ws/components/navigation/horizontal/components/divider';
import { WsHorizontalNavigationComponent } from '@ws/components/navigation/horizontal/horizontal.component';

@UntilDestroy()
@Component({
  selector: 'ws-horizontal-navigation-branch-item',
  templateUrl: './branch.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgClass,
    NgTemplateOutlet,
    RouterModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    WsHorizontalNavigationBasicItemComponent,
    forwardRef(() => WsHorizontalNavigationBranchItemComponent),
    WsHorizontalNavigationDividerItemComponent,
  ],
})
export class WsHorizontalNavigationBranchItemComponent implements OnInit {
  static ngAcceptInputType_child: BooleanInput;

  @Input() child: boolean = false;
  @Input() item: WsNavigationItem;
  @Input() name: string;
  @ViewChild('matMenu', { static: true }) matMenu: MatMenu;

  private _wsHorizontalNavigationComponent: WsHorizontalNavigationComponent;

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
    this._wsHorizontalNavigationComponent = this._wsNavigationService.getComponent(this.name);

    // 在导航组件上订阅onRefreshed
    this._wsHorizontalNavigationComponent.onRefreshed.pipe(untilDestroyed(this)).subscribe(() => {
      // 检测变更
      this._changeDetectorRef.markForCheck();
    });
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 触发变更检测
   */
  triggerChangeDetection(): void {
    // 检测变更
    this._changeDetectorRef.markForCheck();
  }
}
