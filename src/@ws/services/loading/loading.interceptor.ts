import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { WsLoadingService } from '@ws/services/loading/loading.service';
import { finalize, Observable, take } from 'rxjs';

export const WsLoadingInterceptor = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const wsLoadingService = inject(WsLoadingService);
  let handleRequestsAutomatically = false;

  // 订阅自动模式
  wsLoadingService.auto$.pipe(take(1)).subscribe(value => {
    handleRequestsAutomatically = value;
  });

  // 如果“自动”模式已关闭，则无需执行任何操作
  if (!handleRequestsAutomatically) return next(req);

  // 设置加载状态为true
  wsLoadingService._setLoadingStatus(true, req.url);

  return next(req).pipe(
    finalize(() => {
      // 如果出现错误或请求完成，则将状态设置为false
      wsLoadingService._setLoadingStatus(false, req.url);
    }),
  );
};
