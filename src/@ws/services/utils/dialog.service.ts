import { Injectable } from '@angular/core';
import { AlertDialogArgs, ConfirmDialogArgs, Dialog, DialogUtility } from '@syncfusion/ej2-angular-popups';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { StatusType } from '@ws/types';
import { merge, omit } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class WsDialogService {
  alertDialog: Dialog;
  confirmDialog: Dialog;
  gridAlertDialog: Dialog;

  /**
   * 提示框
   *
   * @param options
   * @returns
   */
  alert(type: StatusType = 'info', options: object | AlertDialogArgs = {}): Dialog {
    const icon = this._iconHandle(type);
    const title = options['title'] || '默认标题';
    const content = options['content'] || '默认内容';

    const defaultOptions = {
      title: '',
      content: this._contentHandle(icon, title, content),
      width: 400,
      isModal: true,
      position: { X: 'center', Y: 'center' },
      okButton: { text: '确认', icon: 'e-icons e-check-3 text-green-500' },
      showCloseIcon: false,
      closeOnEscape: true,
      animationSettings: { effect: 'SlideTop', duration: 200 },
      cssClass: 'ws-dialog ws-alert',
    };

    options = merge({}, defaultOptions, omit(options, ['title', 'content']));

    this.alertDialog = DialogUtility.alert(options);

    if (!isNullOrUndefined(options['width'])) this.alertDialog.width = options['width'];

    return this.alertDialog;
  }

  /**
   * 确认框
   *
   * @param options
   * @returns
   */
  confirm(type: StatusType = 'info', options: object | ConfirmDialogArgs = {}): Dialog {
    const icon = this._iconHandle(type);
    const title = options['title'] || '默认标题';
    const content = options['content'] || '默认内容';

    const defaultOptions: ConfirmDialogArgs = {
      title: '',
      content: this._contentHandle(icon, title, content),
      width: 400,
      isModal: true,
      position: { X: 'center', Y: 'center' },
      okButton: { text: '确认', icon: 'e-icons e-check-3 text-green-500' },
      cancelButton: { text: '取消', icon: 'e-icons e-close-5 text-red-500' },
      showCloseIcon: false,
      closeOnEscape: true,
      animationSettings: { effect: 'SlideTop', duration: 200 },
      cssClass: 'ws-dialog ws-confirm',
    };

    options = merge({}, defaultOptions, omit(options, ['title', 'content']));

    this.confirmDialog = DialogUtility.confirm(options);

    // 设置按钮
    const saveButton = this.confirmDialog.buttons[0];
    const cancelButton = this.confirmDialog.buttons[1];
    this.confirmDialog.buttons = [cancelButton, saveButton];
    this.confirmDialog.dataBind();

    if (!isNullOrUndefined(options['width'])) this.confirmDialog.width = options['width'];

    return this.confirmDialog;
  }

  /**
   * 请求错误提示
   *
   * @param options
   * @returns
   */
  requestError(options: { title?: string; url?: string; message?: string }) {
    const defaultOptions = {
      title: '错误提示',
      url: '错误地址',
      message: '错误信息',
      ...options,
    };

    return this.alert('error', {
      title: defaultOptions.title,
      content: `
            <div class="message-box">
                请求地址：${defaultOptions.url}
            </div>
            <div class="message-box error mt-8">
                错误信息：${defaultOptions.message}
            </div>
            `,
    });
  }

  /**
   * 表格提示框
   *
   * @param options
   * @returns
   */
  gridAlert(content: string, targetElement?: HTMLElement, options?: AlertDialogArgs): Dialog {
    const defaultOptions = {
      title: '',
      content,
      position: { X: 'center', Y: 'center' },
      okButton: { text: '确认' },
      animationSettings: { effect: 'None' },
      width: '320px',
    };

    options = merge({}, defaultOptions, options);

    this.gridAlertDialog = DialogUtility.alert(options);

    // 目标容器
    if (targetElement) {
      this.gridAlertDialog.target = targetElement;
      this.gridAlertDialog.refresh();
    }

    return this.alertDialog;
  }

  /**
   * icon判断处理
   *
   * @param type
   * @returns
   */
  private _iconHandle(type: StatusType): string {
    let icon = '';
    switch (type) {
      case 'success':
        icon = 'icon-right-o text-green-500';
        break;
      case 'warning':
        icon = 'icon-warning-o text-amber-500';
        break;
      case 'error':
        icon = 'icon-error-o text-red-500';
        break;
      default:
        icon = 'icon-info-o text-blue-500';
        break;
    }

    return icon;
  }

  /**
   * 默认内容
   *
   * @param icon
   * @param title
   * @param content
   * @returns
   */
  private _contentHandle(icon: string, title: string, content: string): string {
    const contentHtml = `<div>
    <span class="${icon} icon mt-0.5 mr-2.5 text-xl float-left"></span>
    <span class="text-lg leading-6 overflow-hidden font-medium block">${title}</span>
    <div class="ml-7 text-base text-secondary">${content}</div>
    </div>`;

    return contentHtml;
  }
}
