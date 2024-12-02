import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { wsAnimations } from '@ws/animations';
import { WsNavigationService } from '@ws/components/navigation';
import { Navigation } from 'app/core/navigation';
import { BreadcrumbModule, SourceConfig } from 'ng-devui/breadcrumb';
import { filter } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styles: [
    `
      .devui-dropdown-menu {
        @apply p-2;
        .devui-search-container {
          @apply pb-2;
          max-width: 150px !important;
          .devui-input {
            background-color: var(--devui-form-control-bg, #ffffff);
            border: 1px solid var(--devui-form-control-line, #d7d8da);
            color: var(--devui-text, #252b3a);
          }
        }
        .devui-breadcrumb-dropdown-menu {
          @apply py-0 #{'!important'};
          max-width: 150px !important;
          li {
            line-height: 30px !important;
            border-radius: var(--devui-border-radius, 2px);
            a {
              width: unset !important;
              line-height: 30px !important;
              &:hover {
                @apply text-primary #{'!important'};
              }
            }
          }
        }
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: wsAnimations,
  exportAs: 'breadcrumb',
  standalone: true,
  imports: [BreadcrumbModule],
})
export class BreadcrumbComponent implements OnChanges, OnInit {
  /** 导航数据 */
  @Input() navigation: Navigation;
  @Output() readonly navigationChange: EventEmitter<Navigation> = new EventEmitter<Navigation>();

  /** 配置 */
  source: SourceConfig[] = [];

  /**
   * 构造函数
   */
  constructor(
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _wsNavigationService: WsNavigationService,
  ) {}

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 绑定输入改变
   *
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    // 导航数据
    if ('navigation' in changes) {
      const navigation = changes.navigation.currentValue;

      // 更新面包屑导航
      this._breadcrumbNavigation(navigation);

      // 执行可观察对象
      this.navigationChange.next(navigation);
    }
  }

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    // 订阅NavigationEnd事件
    this._router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        untilDestroyed(this),
      )
      .subscribe((event: NavigationEnd) => {
        if (event.url !== '/') {
          // 更新面包屑导航
          this._breadcrumbNavigation(this.navigation);
        }
      });
  }

  // ----------------------------------------------------------------------------
  // @ 私有方法
  // ----------------------------------------------------------------------------

  /**
   * 面包屑导航数据处理
   *
   * @param navigation
   */
  private _breadcrumbNavigation(navigation: Navigation): void {
    const id = this._wsNavigationService.getNavigationId(this._router, 'mainNavigation');
    const rootParent = this._wsNavigationService.getRootParent(id, navigation.default);
    this.source = this._wsNavigationService.getBreadcrumbNavigations(id, rootParent);

    this._changeDetectorRef.detectChanges();
  }
}
