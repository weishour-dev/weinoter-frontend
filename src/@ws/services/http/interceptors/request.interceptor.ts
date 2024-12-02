import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpHeaders, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Result } from '@ws/interfaces';
import { ContextToken } from '@ws/services/http';
import { WsMessageService } from '@ws/services/message';
import type { ObjectHttpHeaders } from '@ws/types';
import { environment } from 'environments/environment';
import { startsWith } from 'lodash-es';
import { catchError, Observable, retry, shareReplay, throwError, timeout } from 'rxjs';

export const RequestInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  /** 前置url */
  let baseUrl = '';

  const document = inject(DOCUMENT);
  const contextToken = inject(ContextToken);
  const wsMessageService = inject(WsMessageService);

  /**
   * 添加额外请求头参数
   *
   * @param headers
   * @returns
   */
  const getAdditionalHeaders = (headers?: HttpHeaders): ObjectHttpHeaders => {
    const res: ObjectHttpHeaders = {};
    const lang = document.documentElement.lang;

    if (!headers?.has('Accept-Language') && lang) res['Accept-Language'] = lang;

    return res;
  };

  let { url } = req;

  // 请求上下文
  const time = req.context.get(contextToken.TIMEOUT);
  const count = req.context.get(contextToken.RETRY_COUNT);
  const delay = req.context.get(contextToken.RETRY_DELAY);
  const httpContext = req.context.get(contextToken.HTTP_CONTEXT);

  // 排除请求本地静态资源 & 请求地址以api开头为Mock
  baseUrl = !startsWith(url, 'assets') && !startsWith(url, 'api/') ? environment.BASE_API : '';

  // 忽略服务端前缀
  if (baseUrl !== '' && url.startsWith('http')) baseUrl = '';

  // 统一添加服务端前缀
  url = baseUrl.endsWith('/') && url.startsWith('/') ? url.substring(1) : url;

  // 克隆请求
  const newReq = req.clone({
    url: baseUrl + url,
    setHeaders: getAdditionalHeaders(req.headers),
  });

  // 将克隆请求发送到下一个处理程序
  return next(newReq).pipe(
    timeout(time),
    retry({ count, delay }),
    catchError((error: HttpErrorResponse) => {
      const body: Result = error.error;

      // toast的错误提示
      if (httpContext.toast && body?.message) wsMessageService.toast('error', body.message);

      return throwError(() => error);
    }),
    shareReplay(1),
  );
};
