import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { TextBoxAllModule, TextBoxComponent } from '@syncfusion/ej2-angular-inputs';
import { ButtonPropsModel, DialogAllModule, DialogComponent } from '@syncfusion/ej2-angular-popups';
import { FormActionArgs, FormActionType } from '@ws/interfaces';
import { DialogProvider } from '@ws/providers';
import { WsMessageService } from '@ws/services/message';
import { UserGroup, UserGroupsService } from 'app/core/systems/user-groups';
import { isUndefined } from 'lodash-es';
import { TabsModule } from 'ng-devui';
import { finalize } from 'rxjs';

@Component({
  selector: 'user-group-form',
  templateUrl: './user-group-form.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, DialogAllModule, TabsModule, TextBoxAllModule, MatRadioModule],
})
export class UserGroupFormComponent implements OnChanges, OnInit {
  @ViewChild('formDialog') formDialog: DialogComponent;
  @ViewChild('userGroupsCode') userGroupsCode: TextBoxComponent;
  @ViewChild('userGroupsName') userGroupsName: TextBoxComponent;

  /** 表单操作类别 (双向绑定) */
  @Input() actionType: FormActionType = 'add';
  @Output() readonly actionTypeChange: EventEmitter<FormActionType> = new EventEmitter<FormActionType>();

  /** 表单数据 (双向绑定) */
  @Input() formData: UserGroup;
  @Output() readonly formDataChange: EventEmitter<UserGroup> = new EventEmitter<UserGroup>();

  /** 列表数据 (双向绑定) */
  @Input() listsData: UserGroup[];
  @Output() readonly listsDataChange: EventEmitter<UserGroup[]> = new EventEmitter<UserGroup[]>();

  /** 操作成功事件 */
  @Output() readonly actionSuccess: EventEmitter<FormActionArgs> = new EventEmitter<FormActionArgs>();

  /** 表单是否新增状态 */
  isAdd: boolean;

  /** 表单操作名称 */
  actionName: string;

  /** 数据名称 */
  dataName = '';

  /** 表单操作按钮 */
  formDlgButtons: ButtonPropsModel[];

  /** 表单实例 */
  form: FormGroup;

  /**
   * 构造函数
   */
  constructor(
    public dialogProvider: DialogProvider,
    private _formBuilder: FormBuilder,
    private _userGroupsService: UserGroupsService,
    private _wsMessageService: WsMessageService,
  ) {}

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 绑定输入改变
   *
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    // 表单操作类别
    if ('actionType' in changes) {
      this.isAdd = this.actionType === 'add';
      this.actionName = this.isAdd ? '新增' : '修改';
      this.dataName = this.isAdd ? '' : `「${this.formData?.name}」`;

      // 执行可观察对象
      this.actionTypeChange.next(changes.actionType.currentValue);
    }

    // 表单数据
    if ('formData' in changes) {
      this.dataName = this.isAdd ? '' : `「${this.formData?.name}」`;

      // 执行可观察对象
      this.formDataChange.next(changes.formData.currentValue);
    }

    // 列表数据
    if ('listsData' in changes) {
      // 执行可观察对象
      this.listsDataChange.next(changes.listsData.currentValue);
    }
  }

  /**
   * 视图初始化后
   */
  ngOnInit(): void {
    // 表单弹窗按钮
    this.formDlgButtons = [
      {
        buttonModel: this.dialogProvider.cancelButton,
        click: () => this.formDialog.hide(),
      },
      {
        buttonModel: this.dialogProvider.saveButton,
        click: () => this.saveHandle(),
      },
    ];

    // 初始化表单
    this.createFormGroup(this.formData);
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 创建表单
   *
   * @param data
   * @returns
   */
  createFormGroup(data: UserGroup): void {
    this.form = this._formBuilder.group({
      id: [data?.id],
      code: [data?.code, Validators.required],
      name: [data?.name, Validators.required],
      description: [data?.description],
      status: [data?.status ?? true],
      sort: [this.actionType === 'add' ? this.listsData?.length + 1 || 0 : data?.sort],
    });
  }

  /**
   * 数据保存
   */
  saveHandle(): void {
    // 如果表单无效则返回
    if (!this._formVerify()) return;

    // 禁用表单
    this.form.disable();

    if (this.isAdd) {
      // 新增
      this._userGroupsService
        .add(this.form.value)
        .pipe(finalize(() => this.form.enable()))
        .subscribe({
          next: data => {
            // 关闭弹窗
            this.formDialog.hide();

            // 执行可观察对象
            const actionType = this.actionType;
            this.actionSuccess.next({ actionType, data });
          },
        });
    } else {
      // 修改
      this._userGroupsService
        .edit(this.form.value)
        .pipe(finalize(() => this.form.enable()))
        .subscribe({
          next: data => {
            // 关闭弹窗
            this.formDialog.hide();

            // 执行可观察对象
            const actionType = this.actionType;
            this.actionSuccess.next({ actionType, data });
          },
        });
    }
  }

  /**
   * 表单弹窗打开事件
   *
   * @param args
   */
  formDialogOpen(args: object): void {
    // 表单赋值
    if (!isUndefined(this.formData)) this.createFormGroup(this.formData);
  }

  /**
   * 表单弹窗关闭事件
   *
   * @param args
   */
  formDialogClose(args: object): void {
    // 重置表单
    this._resetForm();
  }

  // ----------------------------------------------------------------------------
  // @ 私有方法
  // ----------------------------------------------------------------------------

  /**
   * 表单验证
   *
   * @returns
   */
  private _formVerify(): boolean {
    // 数据验证
    if (this.form.invalid) {
      const codeControl = this.form.get('code');
      const nameControl = this.form.get('name');

      if (codeControl.hasError('required')) {
        this.userGroupsCode.focusIn();
        this._wsMessageService.toast('warning', '请输入编号');
      } else if (nameControl.hasError('required')) {
        this.userGroupsName.focusIn();
        this._wsMessageService.toast('warning', '请输入名称');
      }

      return false;
    }

    // 数据是否修改过
    if (!this.form.dirty) {
      this._wsMessageService.toast('warning', '暂无提交修改的数据');
      return false;
    }

    return true;
  }

  /**
   * 重置表单
   */
  private _resetForm(): void {
    this.form.patchValue({ code: null, name: null, description: null, status: true });
  }
}
