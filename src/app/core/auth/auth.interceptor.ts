import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { Observable } from 'rxjs';

export const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  // 克隆请求对象
  let newReq = req.clone();

  // 如果访问令牌没有过期，则添加Authorization头。如果访问令牌过期，这将迫使服务器为受保护的API路由返回一个
  // "401 Unauthorized"响应，我们的响应拦截器将从本地存储捕获并删除访问令牌，同时将用户从应用程序注销
  if (authService.accessToken) {
    let token = authService.accessToken;

    // 若请求为刷新Token请求，令牌则为refreshToken
    if (['/auth/refresh'].some(url => req.url.includes(url))) {
      token = authService.refreshToken;
    }

    newReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  // 将克隆请求发送到下一个处理程序
  return next(newReq);
};
