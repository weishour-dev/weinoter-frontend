import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';
import { ReuseTabService } from '@ws/components/reuse-tab';

export class ReuseTabStrategy implements RouteReuseStrategy {
  private reuseTabService = inject(ReuseTabService);

  // 确定是否应分离该路由（及其子树）以便稍后重用
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return this.reuseTabService.shouldDetach(route);
  }
  // 存储分离的路线
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    this.reuseTabService.store(route, handle);
  }
  // 确定是否应重新附加此路由（及其子树）
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return this.reuseTabService.shouldAttach(route);
  }
  // 检索之前存储的路线
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return this.reuseTabService.retrieve(route);
  }
  // 确定是否应重用路由
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return this.reuseTabService.shouldReuseRoute(future, curr);
  }
}
