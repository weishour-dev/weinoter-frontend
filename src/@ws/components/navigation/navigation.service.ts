import { Injectable } from '@angular/core';
import { Route, Router } from '@angular/router';
import { WsNavigationItem } from '@ws/components/navigation';
import { WsVerticalNavigationComponent } from '@ws/components/navigation/vertical';
import { WS_MENUS_KEY } from '@ws/constants';
import type { SafeAny } from '@ws/types';
import { isNull, startsWith } from 'lodash-es';
import { MenuConfig, SourceConfig } from 'ng-devui/breadcrumb';

@Injectable({ providedIn: 'root' })
export class WsNavigationService {
  private _componentRegistry: Map<string, SafeAny> = new Map<string, SafeAny>();
  private _navigationStore: Map<string, WsNavigationItem[]> = new Map<string, SafeAny>();

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 注册导航组件
   *
   * @param name
   * @param component
   */
  registerComponent(name: string, component: SafeAny): void {
    this._componentRegistry.set(name, component);
  }

  /**
   * 取消注册导航组件
   *
   * @param name
   */
  deregisterComponent(name: string): void {
    this._componentRegistry.delete(name);
  }

  /**
   * 从注册表中获取导航组件
   *
   * @param name
   */
  getComponent<T>(name: string): T {
    return this._componentRegistry.get(name);
  }

  /**
   * 用给定的键存储给定的导航
   *
   * @param key
   * @param navigation
   */
  storeNavigation(key: string, navigation: WsNavigationItem[]): void {
    this._navigationStore.set(key, navigation);
  }

  /**
   * 通过键从存储器获取导航
   *
   * @param key
   */
  getNavigation(key: string): WsNavigationItem[] {
    return this._navigationStore.get(key) ?? [];
  }

  /**
   * 删除存储中的指定键的导航
   *
   * @param key
   */
  deleteNavigation(key: string): void {
    // 检查导航是否存在
    if (!this._navigationStore.has(key)) {
      console.warn(`Navigation with the key '${key}' does not exist in the store.`);
    }

    // 从存储中删除
    this._navigationStore.delete(key);
  }

  /**
   * 获取当前导航的id
   */
  getNavigationId(router: Router, name = 'mainNavigation'): number {
    let navigationId = 0;
    const navComponent = this.getComponent<WsVerticalNavigationComponent>(name);

    if (!navComponent) {
      navigationId = 0;
    } else {
      // 获取导航数据
      const navigation = this.getItemByLink(router.url, navComponent.navigation);
      if (!isNull(navigation)) navigationId = +navigation.id;
    }

    return navigationId;
  }

  /**
   * 返回给定导航数组的平化版本
   *
   * @param navigation
   * @param flatNavigation
   */
  getFlatNavigation(navigation: WsNavigationItem[], flatNavigation: WsNavigationItem[] = []): WsNavigationItem[] {
    for (const item of navigation) {
      if (item.type === 'basic') {
        flatNavigation.push(item);
        continue;
      }

      if (item.type === 'aside' || item.type === 'collapsable' || item.type === 'group') {
        if (item.children) {
          this.getFlatNavigation(item.children, flatNavigation);
        }
      }
    }

    return flatNavigation;
  }

  /**
   * 从给定导航返回具有给定id的项
   *
   * @param id
   * @param navigation
   */
  getItem(id: string | number, navigation: WsNavigationItem[]): WsNavigationItem | null {
    for (const item of navigation) {
      if (item.id === id) {
        return item;
      }

      if (item.children) {
        const childItem = this.getItem(id, item.children);

        if (childItem) {
          return childItem;
        }
      }
    }

    return null;
  }

  /**
   * 从给定导航返回具有给定link的项
   *
   * @param link
   * @param navigation
   */
  getItemByLink(link: string, navigation: WsNavigationItem[]): WsNavigationItem | null {
    for (const item of navigation) {
      if (startsWith(item.link, link)) {
        return item;
      }

      if (item.children) {
        const childItem = this.getItemByLink(link, item.children);

        if (childItem) {
          return childItem;
        }
      }
    }

    return null;
  }

  /**
   * 从给定的导航返回具有给定id的项的父项
   *
   * @param id
   * @param navigation
   * @param parent
   */
  getItemParent(
    id: string,
    navigation: WsNavigationItem[],
    parent: WsNavigationItem[] | WsNavigationItem,
  ): WsNavigationItem[] | WsNavigationItem | null {
    for (const item of navigation) {
      if (item.id === id) {
        return parent;
      }

      if (item.children) {
        const childItem = this.getItemParent(id, item.children, item);

        if (childItem) {
          return childItem;
        }
      }
    }

    return null;
  }

  /**
   * 从给定的导航返回具有给定id的项的根父节点项
   *
   * @param targetMenuId
   * @param navigation
   */
  getRootParent(targetMenuId: string | number, navigation: WsNavigationItem[]): WsNavigationItem | null {
    if (targetMenuId === 0) return null;

    // 创建一个映射，将节点 ID 映射到其父节点的 ID
    const idToParentMap: { [key: string]: string | number | null } = {};

    // 递归构建映射
    const buildIdToParentMap = (nodes: WsNavigationItem[], parent: string | null) => {
      nodes.forEach(node => {
        idToParentMap[node.id.toString()] = parent;

        // 如果节点有子节点，递归调用以构建子节点的映射
        if (node.children && node.children.length > 0) {
          buildIdToParentMap(node.children, node.id.toString());
        }
      });
    };

    // 从根节点开始构建映射
    buildIdToParentMap(navigation, null);

    // 初始化当前节点 ID 为给定的节点 ID
    let currentNodeId: string | number = targetMenuId;

    // 使用映射找到根节点
    while (idToParentMap[currentNodeId] !== null) {
      currentNodeId = idToParentMap[currentNodeId];
    }

    // 在导航树中查找具有最终根节点 ID 的节点并返回
    return navigation.find(node => node.id.toString() == currentNodeId) || null;
  }

  /**
   * 从给定导航返回第一位子级菜单的项
   *
   * @param navigation
   */
  getFirstChildrenMenu(navigation: WsNavigationItem): WsNavigationItem | null {
    if (navigation.children.length > 0) {
      let existBasic = false;

      for (const menu of navigation.children) {
        if (menu.type === 'basic') {
          existBasic = true;
          return this.getFirstChildrenMenu(menu);
        }
      }

      if (!existBasic) return null;
    } else {
      return navigation;
    }
  }

  /**
   * 从给定导航返回面包屑导航数据
   *
   * @param targetMenuId
   * @param navigation
   */
  getBreadcrumbNavigations(targetMenuId: string | number, navigation: WsNavigationItem): SourceConfig[] {
    if (targetMenuId === 0) return [];

    const bNavigations: SourceConfig[] = [];

    const buildBNavigations = (item: WsNavigationItem) => {
      // 根菜单
      const bNavigation: SourceConfig = {
        title: item.title,
        link: item.link,
        noNavigation: true,
        showMenu: item.children.length > 0,
        menuList: [],
      };

      if (item.children.length > 0) {
        for (const menu of item.children) {
          // 组菜单
          const menuNavigation: MenuConfig = {
            name: menu.title,
            link: menu.link.startsWith('/') ? menu.link.substring(1) : menu.link,
            linkType: 'routerLink',
          };

          // 导航地址为第一位子级菜单
          if (menu.children.length > 0) {
            const firstChildren = this.getFirstChildrenMenu(menu);
            if (firstChildren) {
              menuNavigation.link = firstChildren.link.startsWith('/')
                ? firstChildren.link.substring(1)
                : firstChildren.link;
            }
          }

          // 当节点为目录、分组、菜单类型时添加
          if (['group', 'collapsable', 'basic'].includes(menu.type)) bNavigation.menuList.push(menuNavigation);
        }
        if (bNavigation.menuList.length > 20) bNavigation.isSearch = true;
      }

      bNavigations.push(bNavigation);

      if (item.children.length > 0) {
        // 获取当前菜单的根节点
        const currentRootParent = this.getRootParent(targetMenuId, item.children);
        if (item.id != currentRootParent.id) {
          if (currentRootParent.children.length > 0) {
            buildBNavigations(currentRootParent);
          } else {
            // 当前菜单
            const currentMenu: SourceConfig = {
              title: currentRootParent.title,
              link: currentRootParent.link,
              noNavigation: true,
            };
            bNavigations.push(currentMenu);
          }
        }
      }
    };

    buildBNavigations(navigation);

    return bNavigations;
  }

  /**
   * 将后端导航数据处理为前端导航数据
   *
   * @param navigation
   */
  getFrontNavigation(navigation: WsNavigationItem[]): WsNavigationItem[] {
    for (const item of navigation) {
      // 显示隐藏判断
      item.isHidden = <boolean>(<unknown>item['hidden']);
      item.hidden = navigationItem => navigationItem.isHidden;

      if (item.type === 'basic') {
        item.classes = { wrapper: 'ws-menu-item' };
        item.badge = {
          title: item['badgeTitle'],
          // classes: 'px-2 bg-primary-600 text-white rounded-full',
        };

        continue;
      }

      if (['aside', 'collapsable', 'group'].includes(item.type)) {
        if (item.children) {
          this.getFrontNavigation(item.children);
        }
      }
    }

    // 本地存储导航数据
    this.storeNavigation(WS_MENUS_KEY, navigation);

    return navigation;
  }

  /**
   * 通过url查找路由配置中的路由
   *
   * @param url
   * @param routes
   */
  findRouteByUrl(url: string, routes: Route[]): Route {
    url = url.startsWith('/') ? url.substring(1) : url;

    for (const route of routes) {
      if (route.path && route.path === url) return route;

      if (route.children) {
        const childRoute = this.findRouteByUrl(url, route.children);
        if (childRoute) return childRoute;
      }
    }

    return null;
  }
}
