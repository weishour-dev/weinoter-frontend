import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { of, switchMap } from 'rxjs';

export const AuthGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
  const router = inject(Router);

  // 检查认证状态
  return inject(AuthService)
    .check()
    .pipe(
      switchMap(authenticated => {
        // 如果用户没有通过身份验证…
        if (!authenticated) {
          // 使用 redirectUrl 参数重定向到登录页面
          const redirectURL = state.url === '/sign-out' ? '' : `redirectURL=${state.url}`;
          const urlTree = router.parseUrl(`sign-in?${redirectURL}`);

          return of(urlTree);
        }

        // 允许访问
        return of(true);
      }),
    );
};
