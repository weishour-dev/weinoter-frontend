import { HttpRequest } from '@angular/common/http';
import type { SafeAny } from '@ws/types';
import { Observable } from 'rxjs';

export type WsMockApiReplyCallback =
  | ((data: {
      request: HttpRequest<SafeAny>;
      urlParams: { [key: string]: string };
    }) => [number, string | SafeAny] | Observable<SafeAny>)
  | undefined;

export type WsMockApiMethods = 'get' | 'post' | 'patch' | 'delete' | 'put' | 'head' | 'jsonp' | 'options';
