import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { of, switchMap } from 'rxjs';

export const NoAuthGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
  const router = inject(Router);

  // 检查认证状态
  return inject(AuthService)
    .check()
    .pipe(
      switchMap(authenticated => {
        // 如果用户通过了身份验证…
        if (authenticated) return of(router.parseUrl(''));

        // 允许访问
        return of(true);
      }),
    );
};
