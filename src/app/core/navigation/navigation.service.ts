import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WsNavigationItem, WsNavigationService, WsVerticalNavigationComponent } from '@ws/components/navigation';
import { WS_MENUS_KEY } from '@ws/constants';
import { Result } from '@ws/interfaces';
import { WsHttpService } from '@ws/services/http';
import { WsMessageService } from '@ws/services/message';
import { AuthService } from 'app/core/auth';
import { Routes, SystemNavigation } from 'app/core/config';
import { AddMenuDto, EditMenuDto, Menu } from 'app/core/navigation/interfaces';
import { Navigation } from 'app/core/navigation/navigation.types';
import { environment } from 'environments/environment';
import { cloneDeep, remove } from 'lodash-es';
import { map, Observable, ReplaySubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  apiPoint = Routes.systems.menus;
  private _navigation: ReplaySubject<Navigation> = new ReplaySubject<Navigation>(1);

  /**
   * 构造函数
   */
  constructor(
    private _router: Router,
    private _httpClient: HttpClient,
    private _wsHttpService: WsHttpService,
    private _authService: AuthService,
    private _wsNavigationService: WsNavigationService,
    private _wsMessageService: WsMessageService,
  ) {}

  // ----------------------------------------------------------------------------
  // @ 访问器
  // ----------------------------------------------------------------------------

  /**
   * 导航访问器
   */
  get navigation$(): Observable<Navigation> {
    return this._navigation.asObservable();
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 获取激活导航数据
   *
   * @param link
   * @returns
   */
  activatedNavigation(link: string): WsNavigationItem | null {
    const navComponent = this._wsNavigationService.getComponent<WsVerticalNavigationComponent>('mainNavigation');

    // 如果导航组件不存在，则返回
    if (!navComponent) return;

    // 获取导航数据
    return this._wsNavigationService.getItemByLink(link, navComponent.navigation);
  }

  /**
   * 获取所有导航数据
   */
  get1(): Observable<Navigation> {
    return this._httpClient.get<Navigation>('api/common/navigation').pipe(
      tap(navigation => {
        console.log(navigation);
        this._navigation.next(navigation);
      }),
    );
  }

  /**
   * 获取所有导航数据
   */
  get(): Observable<Navigation> {
    return this._wsHttpService
      .get<Result<WsNavigationItem[]>>(`${this.apiPoint}/navigation`, {}, { toast: false })
      .pipe(
        map(result => {
          const menus = this._wsNavigationService.getFrontNavigation(result.data);

          // 不同类型菜单布局数据处理
          const navigationCollect = this._navigationHandle([...menus, ...SystemNavigation]);
          // if (!environment.production) console.log(navigationCollect);
          // 通知导航订阅变更
          this._navigation.next(navigationCollect);

          return navigationCollect;
        }),
      );
  }

  /**
   * 获取菜单列表
   */
  getList(): Observable<Menu[]> {
    return this._wsHttpService
      .get<Result<Menu[]>>(this.apiPoint, {}, { toast: false })
      .pipe(map(result => result.data));
  }

  /**
   * 添加导航数据
   */
  add(addMenuDto: AddMenuDto): Observable<WsNavigationItem> {
    return this._wsHttpService.post<Result<WsNavigationItem>>(`${this.apiPoint}/add`, addMenuDto).pipe(
      map(result => {
        const navigation: WsNavigationItem = result.data;
        this._mainNavigationHandle('add', navigation);
        return navigation;
      }),
    );
  }

  /**
   * 修改导航数据
   */
  edit(editMenuDto: EditMenuDto): Observable<WsNavigationItem> {
    return this._wsHttpService.post<Result<WsNavigationItem>>(`${this.apiPoint}/edit`, editMenuDto).pipe(
      map(result => {
        const navigation: WsNavigationItem = result.data;
        this._mainNavigationHandle('edit', navigation);
        return navigation;
      }),
    );
  }

  /**
   * 删除导航数据
   */
  remove(id: string): Observable<WsNavigationItem> {
    return this._wsHttpService.post<Result<WsNavigationItem>>(`${this.apiPoint}/remove`, { id }).pipe(
      map(result => {
        const navigation: WsNavigationItem = result.data;
        this._mainNavigationHandle('remove', navigation);
        return navigation;
      }),
    );
  }

  /**
   * 导航数据排序
   */
  sort(ids: string[]): Observable<string> {
    return this._wsHttpService.post<Result<string>>(`${this.apiPoint}/sort`, { ids }).pipe(
      map(result => {
        const message = result.message;
        return message;
      }),
    );
  }

  /**
   * 导航到
   *
   * @param url
   */
  goTo(url: string): void {
    setTimeout(() => this._router.navigateByUrl(url));
  }

  /**
   * 导航到新标签页
   *
   * @param url
   */
  goToNewTab(url: string): void {
    window.open(url, '_blank', 'noopener');
  }

  /**
   * 导航到登录页面
   */
  toLogin(message = '登录超时'): void {
    // 登出
    this._authService.signOut(false);

    const toastRef = this._wsMessageService.toast('loading', `${message}，即将重新登录！`, {
      duration: 2000,
    });

    toastRef.afterClosed.subscribe(_ => {
      // 重新加载应用程序
      location.reload();
    });
  }

  /**
   * 导航组件数据更改
   *
   * @param action
   * @param navigationItem
   * @returns void
   */
  actionHandle(action: 'add' | 'edit' | 'remove', navigationItem: WsNavigationItem): void {
    // 获取组件->导航数据->项
    const navComponent = this._wsNavigationService.getComponent<WsVerticalNavigationComponent>('mainNavigation');

    // 如果导航组件不存在，则返回
    if (!navComponent) return;

    // 获取平面导航数据
    const navigation = navComponent.navigation;

    switch (action) {
      // 添加
      case 'add':
        this.get().subscribe();
        break;
      // 修改
      case 'edit':
        const item = this._wsNavigationService.getItem(navigationItem.id, navigation);

        item.type = navigationItem.type;
        item.icon = navigationItem.icon;
        item.title = navigationItem.title;
        item.translation = navigationItem.translation;
        item.link = navigationItem.link;
        item.subtitle = navigationItem.subtitle;
        item.badge = navigationItem.badge;
        item.reuse = navigationItem.reuse;
        item.reuseCloseable = navigationItem.reuseCloseable;
        item.isHidden = navigationItem.isHidden;
        item.hidden = navigationItem.hidden;
        item.disabled = navigationItem.disabled;
        break;
      // 删除
      case 'remove':
        remove(navigation, ['id', navigationItem.id]);
        navComponent.navigation = navigation;
        break;
    }

    // 本地存储导航数据
    this._wsNavigationService.storeNavigation(WS_MENUS_KEY, navigation);

    // 导航组件刷新
    navComponent.refresh();

    // 更新导航数据
    const navigationCollect = this._navigationHandle(navComponent.navigation);
    if (!environment.production) console.log(navigationCollect);
    this._navigation.next(navigationCollect);
  }

  // ----------------------------------------------------------------------------
  // @ 私有方法
  // ----------------------------------------------------------------------------

  /**
   * 不同类型菜单布局数据处理
   *
   * @param defaultNavigation
   * @returns
   */
  private _navigationHandle(defaultNavigation: WsNavigationItem[]): Navigation {
    const _defaultNavigation: WsNavigationItem[] = defaultNavigation;
    const _compactNavigation: WsNavigationItem[] = [];
    const _futuristicNavigation: WsNavigationItem[] = [];
    const _horizontalNavigation: WsNavigationItem[] = [];

    _defaultNavigation.forEach(({ id, title, type, icon, link, ...data }) => {
      if (typeof id === 'string') {
        _compactNavigation.push({ id, title, type: 'aside', icon, children: [] });
        _futuristicNavigation.push({ id, title, type: 'group', children: [] });
        _horizontalNavigation.push({ id, title, type: 'group', icon, children: [] });
      } else {
        const defaultNavigation = { id, title, type, icon, link, ...data };

        _compactNavigation.push(
          defaultNavigation.type === 'group' ? { ...defaultNavigation, type: 'aside' } : defaultNavigation,
        );
        _futuristicNavigation.push(defaultNavigation);
        _horizontalNavigation.push(defaultNavigation);
      }
    });

    _compactNavigation.forEach(compactNavItem => {
      _defaultNavigation.forEach(defaultNavItem => {
        if (defaultNavItem.id === compactNavItem.id) {
          compactNavItem.children = cloneDeep(defaultNavItem.children);
        }
      });
    });

    _futuristicNavigation.forEach(futuristicNavItem => {
      _defaultNavigation.forEach(defaultNavItem => {
        if (defaultNavItem.id === futuristicNavItem.id) {
          futuristicNavItem.children = cloneDeep(defaultNavItem.children);
        }
      });
    });

    _horizontalNavigation.forEach(horizontalNavItem => {
      _defaultNavigation.forEach(defaultNavItem => {
        if (defaultNavItem.id === horizontalNavItem.id) {
          horizontalNavItem.children = cloneDeep(defaultNavItem.children);
        }
      });
    });

    return {
      default: cloneDeep(_defaultNavigation),
      compact: cloneDeep(_compactNavigation),
      futuristic: cloneDeep(_futuristicNavigation),
      horizontal: cloneDeep(_horizontalNavigation),
    };
  }

  /**
   * 导航组件数据更改
   *
   * @param action
   * @param navigationItem
   * @returns void
   */
  private _mainNavigationHandle(action: 'add' | 'edit' | 'remove', navigationItem: WsNavigationItem): void {
    // 获取组件->导航数据->项
    const navComponent = this._wsNavigationService.getComponent<WsVerticalNavigationComponent>('mainNavigation');

    // 如果导航组件不存在，则返回
    if (!navComponent) return;

    // 获取平面导航数据
    const navigation = navComponent.navigation;

    switch (action) {
      // 添加
      case 'add':
        navigationItem.classes = { wrapper: 'ws-menu-item' };
        navComponent.navigation = [...navigation, navigationItem];
        break;
      // 修改
      case 'edit':
        const item = this._wsNavigationService.getItem(navigationItem.id, navigation);
        item.icon = navigationItem.icon;
        item.title = navigationItem.title;
        item.link = navigationItem.link;
        break;
      // 删除
      case 'remove':
        remove(navigation, ['id', navigationItem.id]);
        navComponent.navigation = navigation;
        break;
    }

    // 导航组件刷新
    navComponent.refresh();

    // 更新导航数据
    this._navigation.next({ compact: navComponent.navigation });
  }
}
