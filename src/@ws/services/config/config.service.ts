import { Inject, Injectable, inject } from '@angular/core';
import { WS_CONFIG } from '@ws/services/config/config.constants';
import { StorageService } from '@ws/services/storage';
import type { SafeAny } from '@ws/types';
import { WsConfig } from 'app/core/config';
import { merge } from 'lodash-es';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WsConfigService {
  private _config: BehaviorSubject<SafeAny>;
  private _storageService = inject(StorageService);

  /**
   * 构造函数
   */
  constructor(@Inject(WS_CONFIG) config: WsConfig) {
    this.setSystemConfig(config);

    // 私有
    this._config = new BehaviorSubject(config);
  }

  // ----------------------------------------------------------------------------
  // @ 访问器
  // ----------------------------------------------------------------------------

  get config$(): Observable<SafeAny> {
    return this._config.asObservable();
  }

  /**
   * 获取当前系统配置
   */
  get currentConfig(): Partial<WsConfig> {
    return this._config.value;
  }

  /**
   * 设置配置
   */
  set config(value: SafeAny) {
    this.setConfig(value);
  }

  /**
   * 设置配置 (不通知订阅)
   */
  set configNotNext(value: SafeAny) {
    this.setConfig(value, false);
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 将配置重置为默认值
   */
  reset(): void {
    this.setSystemConfig(this.config);

    // 设置配置
    this._config.next(this.config);
  }

  /**
   * 将系统配置存储
   *
   * @param value
   * @param isNext
   */
  private setConfig(value: SafeAny, isNext: boolean = true): void {
    // 将新配置合并到当前配置
    const config = merge({}, this._config.getValue(), value);

    this.setSystemConfig(config);

    // 执行可观察对象
    isNext && this._config.next(config);
  }

  /**
   * 将系统配置存储在本地存储中
   *
   * @param config
   */
  private setSystemConfig(config: SafeAny): void {
    this._storageService.set('ws-config', config);
  }
}
