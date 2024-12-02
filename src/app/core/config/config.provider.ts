import { Injectable } from '@angular/core';
import { AX_25, AX_50, AY_25, AY_50 } from 'app/core/config';

@Injectable({ providedIn: 'root' })
export class ConfigProvider {
  public readonly AUTH_KEY = 'WS_AUTH';

  /** 超时时间（30秒） */
  public readonly TIMEOUT: number = 30 * 1000;

  /** 重试次数 */
  public readonly RETRY_COUNT: number = 0;

  /** 重试延迟（2秒） */
  public readonly RETRY_DELAY: number = 2 * 1000;

  /** 请求toast */
  public readonly HTTP_TOAST: boolean = true;

  /** 动画配置 */
  public readonly AX_25 = AX_25;
  public readonly AX_50 = AX_50;
  public readonly AY_25 = AY_25;
  public readonly AY_50 = AY_50;
}
