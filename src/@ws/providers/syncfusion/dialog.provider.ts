import { Injectable } from '@angular/core';
import { AnimationSettingsModel, Dialog, DialogComponent, PositionDataModel } from '@syncfusion/ej2-angular-popups';
import { ButtonModel } from '@syncfusion/ej2-buttons';
import { WsDialogService } from '@ws/services/utils';

@Injectable({ providedIn: 'root' })
export class DialogProvider {
  confirmDialog: Dialog;

  constructor(private _wsDialogService: WsDialogService) {}

  /** 取消按钮设置 */
  readonly cancelButton: ButtonModel = {
    content: '取消',
    iconCss: 'e-icons e-close-5 text-red-500',
  };

  /** 保存按钮设置 */
  readonly saveButton: ButtonModel = {
    content: '保存',
    iconCss: 'e-icons e-check-3 text-green-500',
  };

  /** 确定按钮设置 */
  readonly confirmButton: ButtonModel = {
    content: '确定',
    iconCss: 'e-icons e-check-3 text-green-500',
  };

  /** 动画设置 */
  readonly animationSettings: AnimationSettingsModel = { effect: 'SlideTop', duration: 200 };

  /** 位置设置 */
  readonly position: PositionDataModel = { X: 'center', Y: 'center' };

  /**
   * 覆盖层点击
   *
   * @param formDialog
   * @param content
   */
  overlayClick(formDialog: DialogComponent, content: string = '单据未保存，确认关闭？') {
    this.confirmDialog = this._wsDialogService.confirm('warning', {
      title: '关闭弹窗',
      content: content,
      width: 300,
      okButton: {
        click: () => {
          this.confirmDialog.hide();
          setTimeout(() => {
            formDialog.hide();
          }, 300);
        },
      },
    });
  }
}
