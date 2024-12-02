import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  CreateHotToastRef,
  HotToastService,
  ObservableMessages,
  ToastConfig,
  ToastOptions,
  ToastTheme,
  ToastType,
} from '@ngneat/hot-toast';
import { Content } from '@ngneat/overview';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WsNotificationComponent } from '@ws/components/notification';
import { WsConfigService } from '@ws/services/config';
import { WsMediaWatcherService } from '@ws/services/media-watcher';
import type { SafeAny } from '@ws/types';
import { notificationConfig } from 'app/core/config';
import { merge } from 'lodash-es';
import { combineLatest, map, Observable } from 'rxjs';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class WsMessageService {
  /**
   * 构造函数
   */
  constructor(
    private _hotToastService: HotToastService,
    private _wsConfigService: WsConfigService,
    private _wsMediaWatcherService: WsMediaWatcherService,
  ) {
    // 根据配置情况设置主题和方案
    combineLatest([
      this._wsConfigService.config$,
      this._wsMediaWatcherService.onMediaQueryChange$([
        '(prefers-color-scheme: dark)',
        '(prefers-color-scheme: light)',
      ]),
    ])
      .pipe(
        untilDestroyed(this),
        map(([config, mql]) => {
          const options = {
            scheme: config.scheme,
          };

          // 如果方案设置为“自动”
          if (config.scheme === 'auto') {
            // 使用媒体查询决定方案
            options.scheme = mql.breakpoints['(prefers-color-scheme: dark)'] ? 'dark' : 'light';
          }

          return options;
        }),
      )
      .subscribe(options => {
        // 存储选项
        const theme: ToastTheme = options.scheme === 'dark' ? 'snackbar' : 'toast';
        this._hotToastService.defaultConfig = merge({}, this._hotToastService.defaultConfig, {
          theme,
        });
      });
  }

  // ----------------------------------------------------------------------------
  // @ 访问器
  // ----------------------------------------------------------------------------

  get defaultConfig(): ToastConfig {
    return this._hotToastService.defaultConfig;
  }

  set defaultConfig(config: ToastConfig) {
    this._hotToastService.defaultConfig = config;
  }

  /**
   * 带有状态的toast
   *
   * @param status 要在toast上显示的信息
   * @param message 要在toast上显示的信息
   * @param options 其他配置选项
   * @returns
   */
  toast<DataType>(
    status: ToastType | 'show',
    message?: Content,
    options?: ToastOptions<DataType>,
  ): CreateHotToastRef<DataType | unknown> {
    return this._hotToastService[status]<DataType>(message, options);
  }

  /**
   * 带有状态的notification
   *
   * @param status 要在notification上显示的信息
   * @param title 标题
   * @param content 内容
   * @param options 其他配置选项
   * @returns
   */
  notification<DataType>(
    status: ToastType | 'show',
    title: string = '默认标题',
    content: string = '',
    options?: ToastOptions<DataType>,
  ): CreateHotToastRef<DataType | unknown> {
    const data = { title, content };
    options = merge({}, notificationConfig, options, { data });
    return this._hotToastService[status]<DataType>(WsNotificationComponent, options);
  }

  /**
   * 请求成功提示
   *
   * @param value
   * @param options 其他配置选项
   * @returns
   */
  success<DataType>(value: SafeAny, options?: ToastOptions<DataType>): CreateHotToastRef<DataType | unknown> | void {
    return this.toast('success', value?.message, options);
  }

  /**
   * 请求异常提示
   *
   * @param error
   * @param options 其他配置选项
   * @returns
   */
  error<DataType>(error: SafeAny, options?: ToastOptions<DataType>): CreateHotToastRef<DataType | unknown> | void {
    if (typeof error === 'string') {
      return this.toast('error', error, options);
    } else if (error instanceof HttpErrorResponse) {
      return this.toast('error', error.error?.message, options);
    }
  }

  /**
   * 基于流的toast
   *
   * @param messages
   * @returns
   */
  observe<T, DataType>(messages: ObservableMessages<T, DataType>): (source: Observable<T>) => Observable<T> {
    return this._hotToastService.observe(messages);
  }

  /**
   * 关闭
   *
   * @param id
   * @since 如果没有提供ID，将关闭所有的toast
   * @returns
   */
  close(id?: string): void {
    this._hotToastService.close(id);
  }
}
