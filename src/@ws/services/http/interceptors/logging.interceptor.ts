import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { environment } from 'environments/environment';
import { startsWith } from 'lodash-es';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

export const LoggingInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const started = Date.now();
  let ok: string;

  // 排除请求本地静态资源
  if (!startsWith(req.url, 'assets')) {
    // 使用日志扩展服务器响应
    return next(req).pipe(
      tap({
        // 当有成功响应,忽略其他事件
        next: event => (ok = event instanceof HttpResponse ? '成功' : ''),
        // 操作失败
        error: (error: HttpErrorResponse) => (ok = `失败 ${error.status} (${error.statusText})`),
      }),
      // 记录可观察到的响应完成或出现错误时的日志
      finalize(() => {
        const elapsed = Date.now() - started;
        const msg = `${req.method} ${req.urlWithParams} 请求${ok}, 花费了${elapsed}毫秒.`;

        if (!environment.production) console.log(msg);
      }),
    );
  } else {
    // 不做任何处理发送到下一个处理程序
    return next(req);
  }
};
