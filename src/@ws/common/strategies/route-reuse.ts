import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';
import { WsRouteService } from '@ws/services/utils';

export class WsRouteReuse implements RouteReuseStrategy {
  public static handlers: { [key: string]: DetachedRouteHandle } = {};
  // 用一个临时变量记录待删除的路由
  private static waitDelete: string;

  constructor(private _wsRouteService: WsRouteService) {}

  /** 表示对所有路由允许复用 如果你有路由不想利用可以在这加一些业务逻辑判断 */
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return this._wsRouteService.shouldDetach(route);
  }
  /** 当路由离开时会触发。按path作为key存储路由快照&组件当前实例对象 */
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    return this._wsRouteService.store(route, handle);
  }
  /** 若 path 在缓存中有的都认为允许还原路由 */
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return this._wsRouteService.shouldAttach(route);
  }
  /** 从缓存中获取快照，若无则返回null */
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    return this._wsRouteService.retrieve(route);
  }
  /** 进入路由触发，判断是否同一路由 */
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return this._wsRouteService.shouldReuseRoute(future, curr);
  }
}
