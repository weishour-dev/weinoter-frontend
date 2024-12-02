import { Injectable } from '@angular/core';
import type { SafeAny } from '@ws/types';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WsAlertService {
  private readonly _onDismiss: ReplaySubject<string> = new ReplaySubject<string>(1);
  private readonly _onShow: ReplaySubject<string> = new ReplaySubject<string>(1);

  // ----------------------------------------------------------------------------
  // @ 访问器
  // ----------------------------------------------------------------------------

  /**
   * Getter for onDismiss
   */
  get onDismiss(): Observable<SafeAny> {
    return this._onDismiss.asObservable();
  }

  /**
   * Getter for onShow
   */
  get onShow(): Observable<SafeAny> {
    return this._onShow.asObservable();
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 撤离警告提示
   *
   * @param name
   */
  dismiss(name: string): void {
    // 如果没有提供名称则返回
    if (!name) return;

    // 执行可观察对象
    this._onDismiss.next(name);
  }

  /**
   * 显示已撤离警告提示
   *
   * @param name
   */
  show(name: string): void {
    // 如果没有提供名称则返回
    if (!name) return;

    // 执行可观察对象
    this._onShow.next(name);
  }
}
