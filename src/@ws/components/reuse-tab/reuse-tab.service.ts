import { Inject, Injectable, Injector, OnDestroy } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  ExtraOptions,
  NavigationEnd,
  NavigationStart,
  Router,
  ROUTER_CONFIGURATION,
} from '@angular/router';
import { WsNavigationItem, WsNavigationService } from '@ws/components/navigation';
import { REUSE_TAB_CACHED_MANAGER, ReuseTabCachedManager } from '@ws/components/reuse-tab/reuse-tab.cache';
import {
  ReuseComponentRef,
  ReuseHookOnReuseInitType,
  ReuseHookTypes,
  ReuseTabCached,
  ReuseTabMatchMode,
  ReuseTabNotify,
  ReuseTabRouteParamMatchMode,
  ReuseTitle,
} from '@ws/components/reuse-tab/reuse-tab.interfaces';
import {
  REUSE_TAB_STORAGE_KEY,
  REUSE_TAB_STORAGE_STATE,
  ReuseTabStorageState,
} from '@ws/components/reuse-tab/reuse-tab.state';
import { WS_MENUS_KEY } from '@ws/constants';
import { ScrollService } from '@ws/services/utils';
import type { SafeAny } from '@ws/types';
import { BehaviorSubject, Observable, timer, Unsubscribable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReuseTabService implements OnDestroy {
  private _inited = false;
  private _keepingScroll = false;
  private _cachedChange = new BehaviorSubject<ReuseTabNotify | null>(null);
  private _router$?: Unsubscribable;
  private removeUrlBuffer: string | null = null;
  private positionBuffer: { [url: string]: [number, number] } = {};

  /** 路由复用组件 */
  componentRef?: ReuseComponentRef;
  /** 是否调试 */
  debug = false;
  /** 包含路由参数时匹配模式 */
  routeParamMatchMode: ReuseTabRouteParamMatchMode = 'strict';
  /** 复用匹配模式 */
  mode = ReuseTabMatchMode.Menu;
  /** 排除规则，限 `mode=URL` */
  excludes: RegExp[] = [];
  /** 是否存储状态，保持最后一次浏览器的状态 */
  storageState = false;
  /** 保持滚动条容器 */
  keepingScrollContainer?: Element;

  constructor(
    private injector: Injector,
    private wsNavigationService: WsNavigationService,
    @Inject(ROUTER_CONFIGURATION) public routerConfig: ExtraOptions,
    @Inject(REUSE_TAB_CACHED_MANAGER) private cached: ReuseTabCachedManager,
    @Inject(REUSE_TAB_STORAGE_KEY) private stateKey: string,
    @Inject(REUSE_TAB_STORAGE_STATE) private stateSrv: ReuseTabStorageState,
  ) {
    if (this.cached == null) {
      this.cached = { list: [], title: {}, closeable: {} };
    }
  }

  // ----------------------------------------------------------------------------
  // @ 访问器
  // ----------------------------------------------------------------------------

  private get snapshot(): ActivatedRouteSnapshot {
    return this.injector.get(ActivatedRoute).snapshot;
  }

  /**
   * 是否已经初始化完成
   */
  get inited(): boolean {
    return this._inited;
  }

  /**
   * 当前路由地址
   */
  get curUrl(): string {
    return this.getUrl(this.snapshot);
  }

  /** 获取已缓存的路由 */
  get items(): ReuseTabCached[] {
    return this.cached.list;
  }

  /** 获取当前缓存的路由总数 */
  get count(): number {
    return this.cached.list.length;
  }

  /** 订阅缓存变更通知 */
  get change(): Observable<ReuseTabNotify | null> {
    return this._cachedChange.asObservable(); // .pipe(filter(w => w !== null));
  }

  set keepingScroll(value: boolean) {
    this._keepingScroll = value;
    this.initScroll();
  }

  get keepingScroll(): boolean {
    return this._keepingScroll;
  }

  private get isDisabledInRouter(): boolean {
    return this.routerConfig.scrollPositionRestoration === 'disabled';
  }

  private get ss(): ScrollService {
    return this.injector.get(ScrollService);
  }

  /** 自定义当前标题 */
  set title(value: string | ReuseTitle) {
    const url = this.curUrl;
    if (typeof value === 'string') value = { text: value };
    this.cached.title[url] = value;
    this.di('更新当前标签标题: ', value);
    this._cachedChange.next({ active: 'title', url, title: value, list: this.cached.list });
  }

  /** 自定义当前 `closeable` 状态 */
  set closeable(value: boolean) {
    const url = this.curUrl;
    this.cached.closeable[url] = value;
    this.di('更新当前标签closeable属性: ', value);
    this._cachedChange.next({
      active: 'closeable',
      closeable: value,
      list: this.cached.list,
    });
  }

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  ngOnDestroy(): void {
    this.clear();
    this.cached.list = [];
    this._cachedChange.complete();

    if (this._router$) this._router$.unsubscribe();
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  init(): void {
    this.initScroll();
    this._inited = true;
    this.loadState();
  }

  /** 获取指定路径缓存所在位置，`-1` 表示无缓存 */
  index(url: string): number {
    return this.cached.list.findIndex(w => w.url === url);
  }

  /** 获取指定路径缓存是否存在 */
  exists(url: string): boolean {
    return this.index(url) !== -1;
  }

  /** 获取指定路径缓存 */
  get(url?: string): ReuseTabCached | null {
    return url ? this.cached.list.find(w => w.url === url) || null : null;
  }

  /**
   * 获取真实路由
   */
  getTruthRoute(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    let next = route;
    while (next.firstChild) next = next.firstChild;
    return next;
  }

  /**
   * 根据快照获取菜单id
   */
  getId(_snapshot: ActivatedRouteSnapshot): string | number {
    const url = this.getUrl(_snapshot);
    const menu = this.getMenu(url);
    return menu ? menu.id : 0;
  }

  /**
   * 根据快照获取菜单icon
   */
  getIcon(_snapshot: ActivatedRouteSnapshot): string {
    const url = this.getUrl(_snapshot);
    const menu = this.getMenu(url);
    return menu ? menu.icon : '';
  }

  /**
   * 根据快照获取URL地址
   */
  getUrl(route: ActivatedRouteSnapshot): string {
    let next = this.getTruthRoute(route);
    const segments: string[] = [];
    while (next) {
      segments.push(next.url.join('/'));
      next = next.parent!;
    }
    const url = `/${segments
      .filter(i => i)
      .reverse()
      .join('/')}`;
    return url;
  }

  /**
   * 根据id获取菜单
   */
  getMenuById(id: string | number): WsNavigationItem | null | undefined {
    const navigation = this.wsNavigationService.getNavigation(WS_MENUS_KEY);
    const menu = this.wsNavigationService.getItem(id, navigation);
    return menu;
  }

  /**
   * 检查快照是否允许被复用
   */
  can(route: ActivatedRouteSnapshot): boolean {
    const url = this.getUrl(route);
    if (url === this.removeUrlBuffer) return false;

    if (route.data && typeof route.data.reuse === 'boolean') return route.data.reuse;

    if (this.mode !== ReuseTabMatchMode.URL) {
      const menu = this.getMenu(url);
      if (!menu) return false;
      if (this.mode === ReuseTabMatchMode.Menu) {
        if (menu.reuse === false) return false;
      } else {
        if (!menu.reuse || menu.reuse !== true) return false;
      }
      return true;
    }
    return !this.isExclude(url);
  }

  isExclude(url: string): boolean {
    return this.excludes.findIndex(r => r.test(url)) !== -1;
  }

  /**
   * 获取标题，顺序如下：
   *
   * 1. 组件内使用 `ReuseTabService.title = 'new title'` 重新指定文本
   * 2. 路由配置中 data 属性中包含 translation > title
   * 3. 菜单数据中 title 属性
   *
   * @param url 指定URL
   * @param route 指定路由快照
   */
  getTitle(url: string, route?: ActivatedRouteSnapshot): ReuseTitle {
    if (this.cached.title[url]) return this.cached.title[url];

    if (route && route.data && (route.data.translation || route.data.title)) {
      return { text: route.data.title, i18n: route.data.translation };
    }

    const menu = this.getMenu(url);
    return menu ? { text: menu.title, i18n: menu.translation } : { text: url };
  }

  /**
   * 获取 `closeable` 状态，顺序如下：
   *
   * 1. 组件内使用 `ReuseTabService.closeable = true` 重新指定 `closeable` 状态
   * 2. 路由配置中 data 属性中包含 `reuseCloseable`
   * 3. 菜单数据中 `reuseCloseable` 属性
   *
   * @param url 指定URL
   * @param route 指定路由快照
   */
  getCloseable(url: string, route?: ActivatedRouteSnapshot): boolean {
    if (typeof this.cached.closeable[url] !== 'undefined') return this.cached.closeable[url];

    if (route && route.data && typeof route.data.reuseCloseable === 'boolean') return route.data.reuseCloseable;

    const menu = this.mode !== ReuseTabMatchMode.URL ? this.getMenu(url) : null;
    if (menu && typeof menu.reuseCloseable === 'boolean') return menu.reuseCloseable;

    return true;
  }

  /**
   * 获取 `keepingScroll` 状态，顺序如下：
   *
   * 1. 路由配置中 data 属性中包含 `keepingScroll`
   * 2. 菜单数据中 `keepingScroll` 属性
   * 3. 组件 `keepingScroll` 值
   */
  getKeepingScroll(url: string, route?: ActivatedRouteSnapshot): boolean {
    if (route && route.data && typeof route.data.keepingScroll === 'boolean') return route.data.keepingScroll;

    const menu = this.mode !== ReuseTabMatchMode.URL ? this.getMenu(url) : null;
    if (menu && typeof menu.keepingScroll === 'boolean') return menu.keepingScroll;

    return this.keepingScroll;
  }

  /**
   * 生命周期钩子
   *
   * @param method
   * @param comp
   * @param type
   */
  runHook(
    method: ReuseHookTypes,
    comp: ReuseComponentRef | number | undefined,
    type: ReuseHookOnReuseInitType = 'init',
  ): void {
    if (typeof comp === 'number') {
      const item = this.cached.list[comp];
      comp = item._handle?.componentRef;
    }

    if (comp == null || !comp.instance) return;

    const compThis = comp.instance;
    const fn = compThis[method];

    // 如果是刷新，则先触发组件ngOnInit钩子
    if (type === 'refresh') {
      compThis?.ngOnInit && compThis.ngOnInit();
    }

    if (typeof fn !== 'function') return;

    if (method === '_onReuseInit') {
      fn.call(compThis, type);
    } else {
      (fn as () => void).call(compThis);
    }
  }

  /**
   * 根据URL移除标签
   *
   * @param [includeNonCloseable=false] 是否强制包含不可关闭
   */
  close(url: string, includeNonCloseable: boolean = false): boolean {
    this.removeUrlBuffer = url;

    this.remove(url, includeNonCloseable);

    this._cachedChange.next({ active: 'close', url, list: this.cached.list });

    this.di('关闭标签', url);
    return true;
  }

  /**
   * 清除左侧
   *
   * @param [includeNonCloseable=false] 是否强制包含不可关闭
   */
  closeLeft(url: string, includeNonCloseable: boolean = false): boolean {
    const start = this.index(url);

    // 当前操作标签为活动标签时
    if (start == -1) {
      // 清除所有缓存
      this.cached.list.forEach(w => {
        if (!includeNonCloseable && w.closeable) this.destroy(w._handle);
      });
      this.cached.list = this.cached.list.filter(w => !includeNonCloseable && !w.closeable);
    } else {
      // 移除左侧标签
      for (let i = start - 1; i >= 0; i--) {
        this.remove(i, includeNonCloseable);
      }
    }

    this.removeUrlBuffer = null;

    this._cachedChange.next({ active: 'closeLeft', url, list: this.cached.list });

    this.di('关闭左侧标签', url);
    return true;
  }

  /**
   * 清除右侧
   *
   * @param [includeNonCloseable=false] 是否强制包含不可关闭
   */
  closeRight(url: string, includeNonCloseable: boolean = false): boolean {
    const start = this.index(url);
    for (let i = this.count - 1; i > start; i--) {
      this.remove(i, includeNonCloseable);
    }

    this.removeUrlBuffer = null;

    this._cachedChange.next({ active: 'closeRight', url, list: this.cached.list });

    this.di('关闭右侧标签', url);
    return true;
  }

  /**
   * 清除其他
   *
   * @param [includeNonCloseable=false] 是否强制包含不可关闭
   */
  closeOther(url: string, includeNonCloseable: boolean = false): void {
    this.cached.list.forEach(w => {
      if (!includeNonCloseable && w.url !== url && w.closeable) this.destroy(w._handle);
    });
    this.cached.list = this.cached.list.filter(w => (!includeNonCloseable && !w.closeable) || w.url == url);

    this.removeUrlBuffer = null;

    this._cachedChange.next({ active: 'closeOther', list: this.cached.list });

    this.di('清除其他标签');
  }

  /**
   * 清除所有缓存
   *
   * @param [includeNonCloseable=false] 是否强制包含不可关闭
   */
  clear(includeNonCloseable: boolean = false): void {
    this.cached.list.forEach(w => {
      if (!includeNonCloseable && w.closeable) this.destroy(w._handle);
    });
    this.cached.list = this.cached.list.filter(w => !includeNonCloseable && !w.closeable);

    this.removeUrlBuffer = null;

    this._cachedChange.next({ active: 'clear', list: this.cached.list });

    this.di('清除所有标签');
  }

  /**
   * 移动缓存数据
   *
   * @param url 要移动的URL地址
   * @param position 新位置，下标从 `0` 开始
   *
   * @example
   * ```
   * // source
   * [ '/a/1', '/a/2', '/a/3', '/a/4', '/a/5' ]
   * move('/a/1', 2);
   * // output
   * [ '/a/2', '/a/3', '/a/1', '/a/4', '/a/5' ]
   * move('/a/1', -1);
   * // output
   * [ '/a/2', '/a/3', '/a/4', '/a/5', '/a/1' ]
   * ```
   */
  move(url: string, position: number): void {
    const start = this.cached.list.findIndex(w => w.url === url);
    if (start === -1) return;
    const data = this.cached.list.slice();
    data.splice(position < 0 ? data.length + position : position, 0, data.splice(start, 1)[0]);
    this.cached.list = data;
    this._cachedChange.next({ active: 'move', url, position, list: this.cached.list });
  }

  /**
   * 强制关闭当前路由（包含不可关闭状态），并重新导航至 `newUrl` 路由
   */
  replace(newUrl: string): void {
    const url = this.curUrl;
    if (this.exists(url)) {
      this.close(url, true);
    } else {
      this.removeUrlBuffer = url;
    }
    this.injector.get<Router>(Router).navigateByUrl(newUrl);
  }

  /**
   * 清除标题缓存
   */
  clearTitleCached(): void {
    this.cached.title = {};
  }

  /**
   * 清空 `closeable` 缓存
   */
  clearCloseableCached(): void {
    this.cached.closeable = {};
  }

  /**
   * 刷新，触发一个 refresh 类型事件
   */
  refresh(data?: SafeAny): void {
    this._cachedChange.next({ active: 'refresh', data });
  }

  // ----------------------------------------------------------------------------
  // @ 私有方法
  // ----------------------------------------------------------------------------

  private destroy(_handle: SafeAny): void {
    if (_handle && _handle.componentRef && _handle.componentRef.destroy) _handle.componentRef.destroy();
  }

  private di(...args: SafeAny[]): void {
    if (!this.debug) return;
    console.warn(...args);
  }

  private loadState(): void {
    if (!this.storageState) return;

    this.cached.list = this.stateSrv.get(this.stateKey).map(v => ({
      id: v.id,
      icon: v.icon,
      title: { text: v.title },
      url: v.url,
      position: v.position,
    }));
    this._cachedChange.next({ active: 'loadState' });
  }

  private getMenu(url: string): WsNavigationItem | null | undefined {
    const navigation = this.wsNavigationService.getNavigation(WS_MENUS_KEY);
    const menu = this.wsNavigationService.getItemByLink(url, navigation);
    return menu;
  }

  private hasInValidRoute(route: ActivatedRouteSnapshot): boolean {
    return !route.routeConfig || !!route.routeConfig.loadChildren || !!route.routeConfig.children;
  }

  private initScroll(): void {
    if (this._router$) this._router$.unsubscribe();

    this._router$ = this.injector.get<Router>(Router).events.subscribe(e => {
      if (e instanceof NavigationStart) {
        const url = this.curUrl;
        if (this.getKeepingScroll(url, this.getTruthRoute(this.snapshot))) {
          this.positionBuffer[url] = this.ss.getScrollPosition(this.keepingScrollContainer);
        } else {
          delete this.positionBuffer[url];
        }
      } else if (e instanceof NavigationEnd) {
        const url = this.curUrl;
        const item = this.get(url);
        if (item && item.position && this.getKeepingScroll(url, this.getTruthRoute(this.snapshot))) {
          if (this.isDisabledInRouter) {
            this.ss.scrollToPosition(this.keepingScrollContainer, item.position);
          } else {
            setTimeout(() => this.ss.scrollToPosition(this.keepingScrollContainer, item.position!), 1);
          }
        }
      }
    });
  }

  private remove(url: string | number, includeNonCloseable: boolean): boolean {
    const idx = typeof url === 'string' ? this.index(url) : url;
    const item = idx !== -1 ? this.cached.list[idx] : null;
    if (!item || (!includeNonCloseable && !item.closeable)) return false;

    this.destroy(item._handle);

    this.cached.list.splice(idx, 1);
    delete this.cached.title[url];
    return true;
  }

  // ----------------------------------------------------------------------------
  // @ RouteReuseStrategy方法
  // ----------------------------------------------------------------------------

  /**
   * 决定是否允许路由复用，若 `true` 会触发 `store`
   */
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    if (this.hasInValidRoute(route)) return false;
    this.di('#shouldDetach', this.can(route), this.getUrl(route));
    return this.can(route);
  }

  /**
   * 存储快照
   */
  store(_snapshot: ActivatedRouteSnapshot, _handle: SafeAny): void {
    const url = this.getUrl(_snapshot);
    const idx = this.index(url);
    const isAdd = idx === -1;

    const item: ReuseTabCached = {
      id: this.getId(_snapshot),
      icon: this.getIcon(_snapshot),
      title: this.getTitle(url, _snapshot),
      closeable: this.getCloseable(url, _snapshot),
      position: this.getKeepingScroll(url, _snapshot) ? this.positionBuffer[url] : null,
      url,
      _snapshot,
      _handle,
    };

    if (isAdd) {
      this.cached.list.push(item);
    } else {
      // 激活路由时当前处理程序为空
      // 为了更好的可靠性，我们需要在调用 _onReuseInit 之前等待组件被附加
      const cahcedComponentRef = this.cached.list[idx]._handle?.componentRef;
      if (_handle == null && cahcedComponentRef != null) {
        timer(100).subscribe(() => this.runHook('_onReuseInit', cahcedComponentRef));
      }
      this.cached.list[idx] = item;
    }

    this.removeUrlBuffer = null;

    this.di('#store', isAdd ? '[new]' : '[override]', url);

    if (_handle && _handle.componentRef) {
      this.runHook('_onReuseDestroy', _handle.componentRef);
    }

    if (!isAdd) {
      this._cachedChange.next({ active: 'override', item, list: this.cached.list });
    }
  }

  /**
   * 决定是否允许应用缓存数据
   */
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    if (this.hasInValidRoute(route)) return false;
    const url = this.getUrl(route);
    const data = this.get(url);
    const ret = !!(data && data._handle);
    this.di('#shouldAttach', ret, url);
    if (!ret) {
      this._cachedChange.next({ active: 'add', url, list: this.cached.list });
    }
    return ret;
  }

  /**
   * 提取复用数据
   */
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if (this.hasInValidRoute(route)) return null;
    const url = this.getUrl(route);
    const data = this.get(url);
    const ret = (data && data._handle) || null;
    this.di('#retrieve', url, ret);
    return ret;
  }

  /**
   * 决定是否应该进行复用路由处理
   */
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    let ret = future.routeConfig === curr.routeConfig;
    if (!ret) return false;

    const path = ((future.routeConfig && future.routeConfig.path) || '') as string;
    if (path.length > 0 && ~path.indexOf(':')) {
      if (this.routeParamMatchMode === 'strict') {
        ret = this.getUrl(future) === this.getUrl(curr);
      } else {
        ret = path === ((curr.routeConfig && curr.routeConfig.path) || '');
      }
    }
    this.di('=====================');
    this.di('#shouldReuseRoute', ret, `${this.getUrl(curr)}=>${this.getUrl(future)}`, future, curr);
    return ret;
  }
}
