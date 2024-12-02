import { Platform } from '@angular/cdk/platform';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  BeforeOpenCloseMenuEventArgs,
  ContextMenuComponent,
  ContextMenuModule,
  MenuEventArgs,
} from '@syncfusion/ej2-angular-navigations';
import { closest, isNullOrUndefined } from '@syncfusion/ej2-base';
import { wsAnimations } from '@ws/animations';
import { WsNavigationService } from '@ws/components/navigation';
import {
  REUSE_TAB_STORAGE_KEY,
  REUSE_TAB_STORAGE_STATE,
  ReuseItem,
  ReuseTabCached,
  ReuseTabNotify,
  ReuseTabService,
  ReuseTabStorageState,
  ReuseTitle,
} from '@ws/components/reuse-tab';
import { WsMessageService } from '@ws/services/message';
import type { SafeAny } from '@ws/types';
import { cloneDeep, find } from 'lodash-es';
import { TabComponent, TabsModule } from 'ng-devui';
import { debounceTime, filter, of } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'ws-reuse-tab',
  templateUrl: './reuse-tab.component.html',
  styleUrls: ['./reuse-tab.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: wsAnimations,
  standalone: true,
  imports: [MatIconModule, MatDividerModule, TabsModule, ContextMenuModule, TranslocoModule],
})
export class WsReuseTabComponent implements OnInit {
  /** 标签列表 */
  tabList: ReuseItem[] = [];

  /** 当前标签 */
  tabActiveId: string | number;
  tabActive: ReuseItem;

  /** 标签位置 */
  position = 0;

  /** 右键标签 */
  tabContextmenuData: ReuseItem;

  /** 标签切换时回调 */
  @Output() readonly tabChange = new EventEmitter<ReuseItem>();

  /** 标签删除时回调 */
  @Output() readonly closeChange = new EventEmitter<ReuseItem[]>();

  /** 标签右键菜单实体 */
  @ViewChild('tabContextmenu') tabContextmenu: ContextMenuComponent;

  /**
   * 构造函数
   */
  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _platform: Platform,
    private _changeDetectorRef: ChangeDetectorRef,
    private _translocoService: TranslocoService,
    private _reuseTabService: ReuseTabService,
    private _wsNavigationService: WsNavigationService,
    private _wsMessageService: WsMessageService,
    @Inject(REUSE_TAB_STORAGE_KEY) private stateKey: string,
    @Inject(REUSE_TAB_STORAGE_STATE) private stateSrv: ReuseTabStorageState,
  ) {}

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    if (!this._platform.isBrowser) return;

    this._reuseTabService.change.pipe(untilDestroyed(this)).subscribe(result => {
      switch (result?.active) {
        case 'title':
          this.updateTitle(result);
          return;
        case 'override':
          if (result?.list?.length === this.tabList.length) {
            this.updatePosition();
            return;
          }
          break;
      }

      this.getList(result);
    });

    this._translocoService.langChanges$
      .pipe(
        filter(() => this._reuseTabService.inited),
        untilDestroyed(this),
        debounceTime(100),
      )
      .subscribe(() => this.getList({ active: 'title' }));

    this._reuseTabService.init();
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 设置激活路由的实例，在 `src/app/layout/layouts/xxxx` 修改：
   *
   * <reuse-tab #reuseTab />
   * <router-outlet (activate)="reuseTab.activate($event)" (attach)="reuseTab.activate($event)" />
   *
   * 若不指定 (activate) 事件，无法刷新未缓存过的当前标签页
   */
  activate(instance: SafeAny): void {
    this._reuseTabService.componentRef = { instance };
  }

  /**
   * 标签切换事件
   *
   * @param id
   */
  activeTabChange(id: string | number): void {
    this.tabActive = find(this.tabList, ['id', id]);
    this.goTo(this.tabActive.index);
  }

  /**
   * 右键菜单打开之前事件
   */
  contextMenubeforeOpen(args: BeforeOpenCloseMenuEventArgs): void {
    // 位置偏移处理
    args.left = args.left + 2;
    args.top = args.top + 4;

    // 标签选项启用禁用处理
    const currentTarget = this.tabContextmenu['currentTarget'];
    const targetElement = closest(currentTarget, '.devui-nav-tab-item') as unknown as TabComponent;
    this.tabContextmenuData = cloneDeep(find(this.tabList, ['id', +targetElement.id]));

    this.tabContextmenu.enableItems(['close'], this.tabContextmenuData.closeable, true);
    this.tabContextmenu.enableItems(['closeLeft'], this.tabContextmenuData.index !== 0, true);
    this.tabContextmenu.enableItems(['closeRight'], !this.tabContextmenuData.last, true);
    this.tabContextmenu.enableItems(['closeOther'], this.tabList.length > 1, true);
    this.tabContextmenu.enableItems(['closeAll'], this.tabList.length > 1, true);

    // 标签关闭禁用时
    const leftCloseable = find<ReuseItem>(
      this.tabList,
      tab => tab.closeable && tab.index < this.tabContextmenuData.index,
    );
    // 左侧标签有可关闭
    this.tabContextmenu.enableItems(['closeLeft'], !isNullOrUndefined(leftCloseable), true);

    const rightCloseable = find<ReuseItem>(
      this.tabList,
      tab => tab.closeable && tab.index > this.tabContextmenuData.index,
      this.tabContextmenuData.index + 1,
    );
    // 右侧标签有可关闭
    this.tabContextmenu.enableItems(['closeRight'], !isNullOrUndefined(rightCloseable), true);

    // 左侧标签有可关闭 || 右侧标签有可关闭
    this.tabContextmenu.enableItems(
      ['closeOther'],
      !isNullOrUndefined(leftCloseable) || !isNullOrUndefined(rightCloseable),
      true,
    );
  }

  /**
   * 右键菜单选项点击事件
   */
  contextMenuSelect(args: MenuEventArgs): void {
    const item = args.item;
    let fn: (() => void) | null = null;

    switch (item.id) {
      case 'refresh':
        this.refresh(this.tabContextmenuData);
        break;
      case 'close':
        this.closeTab(this.tabContextmenuData.id);
        break;
      case 'closeLeft':
        fn = () => {
          this._reuseTabService.closeLeft(this.tabContextmenuData.url, false);
          this.closeChange.emit(null);
        };

        // 当前操作标签未活动 && 当前操作标签在活动标签右侧时
        if (
          !this.tabContextmenuData.active &&
          this.tabContextmenuData.index >= this.tabList.find(x => x.active)!.index
        ) {
          this.goTo(this.tabContextmenuData.index, fn);
        } else {
          fn();
        }
        break;
      case 'closeRight':
        fn = () => {
          this._reuseTabService.closeRight(this.tabContextmenuData.url, false);
          this.closeChange.emit(null);
        };

        // 当前操作标签未活动 && 当前操作标签在活动标签左侧时
        if (
          !this.tabContextmenuData.active &&
          this.tabContextmenuData.index <= this.tabList.find(x => x.active)!.index
        ) {
          this.goTo(this.tabContextmenuData.index, fn);
        } else {
          fn();
        }
        break;
      case 'closeOther':
        fn = () => {
          this._reuseTabService.closeOther(this.tabContextmenuData.url, false);
          this.closeChange.emit(null);
        };

        // 当前操作标签未活动
        if (!this.tabContextmenuData.active) {
          this.goTo(this.tabContextmenuData.index, fn);
        } else {
          fn();
        }
        break;
    }
  }

  /**
   * 导航
   *
   * @param index
   */
  goTo(index: number, cb?: () => void): void {
    index = Math.max(0, Math.min(index, this.tabList.length - 1));
    const item = this.tabList[index];

    // 根据url进行导航
    this._router.navigateByUrl(item.url).then(result => {
      if (!result) return;
      this.tabChange.emit(this.tabActive);
      if (cb) cb();
    });
  }

  /**
   * 刷新
   *
   * @param item
   */
  refresh(item: ReuseItem): void {
    this._router.navigateByUrl(item.url, { onSameUrlNavigation: 'reload' });

    this._reuseTabService.runHook(
      '_onReuseInit',
      this.position === item.index ? this._reuseTabService.componentRef : item.index,
      'refresh',
    );

    this._wsMessageService.toast('success', '页面刷新成功');
  }

  /**
   * 删除标签
   *
   * @param id
   * @param includeNonCloseable
   */
  closeTab(id: string | number, includeNonCloseable: boolean = false): boolean {
    if (this.tabList.length === 1) {
      this._wsMessageService.toast('warning', '不可关闭最后标签');
      return false;
    }

    const item = find(this.tabList, ['id', id]);

    of(true)
      .pipe(filter(v => v))
      .subscribe(() => {
        this._reuseTabService.close(item.url, includeNonCloseable);
        this.closeChange.emit([item]);
        this._changeDetectorRef.detectChanges();
      });

    return false;
  }

  // ----------------------------------------------------------------------------
  // @ 私有方法
  // ----------------------------------------------------------------------------

  /**
   * 获取标签名称
   *
   * @param title
   */
  private getTitle(title: ReuseTitle): string {
    return !isNullOrUndefined(title.i18n) && title.i18n !== ''
      ? this._translocoService.translate(`menu.${title.i18n}`)
      : title.text!;
  }

  /**
   * 获取当前标签
   */
  private genCurrentItem(): ReuseItem {
    const id = this._reuseTabService.getId(this._activatedRoute.snapshot);
    const icon = this._reuseTabService.getIcon(this._activatedRoute.snapshot);
    const url = this._reuseTabService.getUrl(this._activatedRoute.snapshot);
    const snapshotTrue = this._reuseTabService.getTruthRoute(this._activatedRoute.snapshot);
    const title = this.getTitle(this._reuseTabService.getTitle(url, snapshotTrue));
    const closeable = this._reuseTabService.count > 0 && this._reuseTabService.getCloseable(url, snapshotTrue);

    return { id, icon, url, title, closeable, active: false, last: false, index: 0 };
  }

  /**
   * 获取标签列表
   *
   * @param notify
   */
  private getList(notify: ReuseTabNotify | null): void {
    const list = this._reuseTabService.items.map(
      (item: ReuseTabCached, index: number) =>
        ({
          id: item.id,
          icon: item.icon,
          url: item.url,
          title: this.getTitle(item.title),
          closeable: item.closeable && this._reuseTabService.count > 0,
          position: item.position,
          index,
          active: false,
          last: false,
        }) as ReuseItem,
    );

    const url = this._reuseTabService.getUrl(this._activatedRoute.snapshot);
    let addCurrent = list.findIndex(item => item.url === url) === -1;

    if (notify && notify.active === 'close' && notify.url === url) {
      addCurrent = false;
      let toPos = 0;
      const curItem = find(this.tabList, ['url', url])!;

      if (curItem.index === list.length) {
        // 最后关闭时
        toPos = list.length - 1;
      } else if (curItem.index < list.length) {
        // 当关闭在中间时应该激活下一个选项卡
        toPos = Math.max(0, curItem.index);
      }

      if (toPos >= 0) this._router.navigateByUrl(list[toPos].url);
    }

    if (addCurrent) list.push(this.genCurrentItem());

    list.forEach((item, index) => (item.index = index));
    if (list.length === 1) list[0].closeable = false;
    this.tabList = list;

    this._changeDetectorRef.detectChanges();

    this.updatePosition();

    switch (notify.active) {
      case 'add':
        const router = this._wsNavigationService.findRouteByUrl(notify.url, this._router.config);
        const reuse = !(router && router.data && typeof router.data.reuse === 'boolean' && router.data.reuse == false);

        setTimeout(() => reuse && this.tabContextmenu && this.tabContextmenu?.refresh());
        break;
    }
  }

  /**
   * 更新标签名称
   *
   * @param result
   */
  private updateTitle(result: ReuseTabNotify): void {
    const item = find(this.tabList, ['url', result!.url]);
    if (!item) return;
    item.title = this.getTitle(result!.title!);
    this._changeDetectorRef.detectChanges();
  }

  /**
   * 保存状态
   */
  private saveState(): void {
    if (!this._reuseTabService.inited || true) return;

    this.stateSrv.update(this.stateKey, this.tabList);
  }

  /**
   * 更新位置
   */
  private updatePosition(): void {
    const url = this._reuseTabService.getUrl(this._activatedRoute.snapshot);
    const list = this.tabList.filter(item => item.url === url || !this._reuseTabService.isExclude(item.url));
    if (list.length === 0) return;

    const lastItem = list[list.length - 1];
    let item = find(list, ['url', url]);

    lastItem.last = true;
    const position = item == null ? lastItem.index : item.index;
    list.forEach((i, idx) => (i.active = position === idx));
    this.position = position;
    if (isNullOrUndefined(item)) item = this.tabList[position];
    this.tabActiveId = item.id;
    this.tabList = list;
    this._changeDetectorRef.detectChanges();
    this.saveState();
  }
}
