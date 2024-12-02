import { HttpInterceptorFn } from '@angular/common/http';

import { ErrorInterceptor } from './error.interceptor';
import { LoggingInterceptor } from './logging.interceptor';
import { RequestInterceptor } from './request.interceptor';

/* 由外而内的Http拦截器提供程序 */
export const INTERCEPTOR_PROVIDES: HttpInterceptorFn[] = [RequestInterceptor, ErrorInterceptor, LoggingInterceptor];
