import { Injectable } from '@angular/core';
import { WsMessageService } from '@ws/services/message';
import { AuthService } from 'app/core/auth';
import { NavigationService } from 'app/core/navigation';
import { BehaviorSubject, catchError, filter, firstValueFrom, switchMap, take, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WsFetchService {
  private _refreshToking = false; // 是否正在刷新 token
  private _refreshToken$ = new BehaviorSubject(null); // 刷新 token 结果的 observable

  /**
   * 构造函数
   */
  constructor(
    public authService: AuthService,
    public wsMessageService: WsMessageService,
    public navigationService: NavigationService,
  ) {}

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * Fetch刷新token请求处理
   * @param fetchFunction
   * @returns Promise<Response>
   */
  async fetchWithTokenRefresh(fetchFunction: () => Promise<Response>): Promise<Response> {
    try {
      return await fetchFunction();
    } catch (error) {
      if (error.message === 'Unauthorized') {
        return this.handleTokenRefresh(fetchFunction);
      } else if (error instanceof TypeError) {
        // 处理客户端发生的网络错误
        this.wsMessageService.toast('error', '未知错误，服务异常或CORS不支持', {
          autoClose: false,
          dismissible: true,
        });
      }
      // throw error; // 其他错误抛出
    }
  }

  /**
   * 刷新token请求处理
   * @param fetchFunction
   * @returns Promise<Response>
   */
  handleTokenRefresh(fetchFunction: () => Promise<Response>): Promise<Response> {
    if (this._refreshToking) {
      // 如果正在刷新 token，则等待刷新完成
      return firstValueFrom(
        this._refreshToken$.pipe(
          filter(v => !!v), // 等待刷新完成
          take(1),
          switchMap(() => fetchFunction()), // 刷新完成后重新执行请求
        ),
      );
    }

    this._refreshToking = true;
    this._refreshToken$.next(null); // 通知其他请求等待

    return firstValueFrom(
      this.authService.refreshTokenRequest().pipe(
        switchMap(() => {
          this._refreshToking = false;
          this._refreshToken$.next(true); // 通知其他请求可以继续执行
          return fetchFunction(); // 刷新完成后重新执行请求
        }),
        catchError(error => {
          this._refreshToking = false; // 重置状态
          // 可根据需要处理刷新失败，例如跳转到登录页
          return throwError(() => error);
        }),
      ),
    );
  }
}
