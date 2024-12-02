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
import { DdtDataBoundEventArgs, DropDownTreeAllModule, DropDownTreeComponent } from '@syncfusion/ej2-angular-dropdowns';
import { TextBoxAllModule, TextBoxComponent } from '@syncfusion/ej2-angular-inputs';
import { ButtonPropsModel, DialogAllModule, DialogComponent } from '@syncfusion/ej2-angular-popups';
import { FormActionArgs, FormActionType } from '@ws/interfaces';
import { DialogProvider, GropDownTreeProvider } from '@ws/providers';
import { WsMessageService } from '@ws/services/message';
import { Department, DepartmentsService } from 'app/core/systems/departments';
import { isUndefined } from 'lodash-es';
import { TabsModule } from 'ng-devui';
import { finalize } from 'rxjs';

@Component({
  selector: 'organizations-department-form',
  templateUrl: './department-form.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DialogAllModule,
    TabsModule,
    TextBoxAllModule,
    DropDownTreeAllModule,
    MatRadioModule,
  ],
})
export class DepartmentFormComponent implements OnChanges, OnInit {
  @ViewChild('formDialog') formDialog: DialogComponent;
  @ViewChild('parentDepartment') parentDepartment: DropDownTreeComponent;
  @ViewChild('departmentsName') departmentsName: TextBoxComponent;

  /** 表单操作类别 (双向绑定) */
  @Input() actionType: FormActionType = 'add';
  @Output() readonly actionTypeChange: EventEmitter<FormActionType> = new EventEmitter<FormActionType>();

  /** 表单数据 (双向绑定) */
  @Input() formData: Department;
  @Output() readonly formDataChange: EventEmitter<Department> = new EventEmitter<Department>();

  /** 上级部门Id (双向绑定) */
  @Input() parentId: number;
  @Output() readonly parentIdChange: EventEmitter<number> = new EventEmitter<number>();

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

  /** 上级部门id */
  parentDepartmentId: string[] = [];
  /** 上级部门数据 */
  parentDepartments: Department[];

  /** 修改之前数据 */
  beforeEditData = null;

  /**
   * 构造函数
   */
  constructor(
    public dialogProvider: DialogProvider,
    public gropDownTreeProvider: GropDownTreeProvider,
    private _formBuilder: FormBuilder,
    private _departmentsService: DepartmentsService,
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

    // 上级部门Id
    if ('parentId' in changes) {
      // 执行可观察对象
      this.parentIdChange.next(changes.parentId.currentValue);
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
   * 初始化上级部门数据
   */
  initParentDepartmentsData(): void {
    // 上级部门列表数据
    this._departmentsService.parent().subscribe(parentDepartments => {
      this.parentDepartments = parentDepartments;
      this.parentDepartment.fields = this.gropDownTreeProvider.fields(parentDepartments);
    });
  }

  /**
   * 创建表单
   *
   * @param data
   * @returns
   */
  createFormGroup(data: Department): void {
    this.form = this._formBuilder.group({
      id: [data?.id],
      parentId: [data?.parentId],
      code: [data?.code],
      name: [data?.name, Validators.required],
      description: [data?.description],
      status: [data?.status ?? true],
    });

    // 表单字段处理
    const parentIdControl = this.form.get('parentId');
    parentIdControl.addValidators(Validators.required);
    parentIdControl.updateValueAndValidity();
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
      this._departmentsService
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
      this._departmentsService
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
    if (!isUndefined(this.formData)) {
      this.createFormGroup(this.formData);

      if (this.actionType === 'edit') this.beforeEditData = this.formData;
    }

    this.initParentDepartmentsData();
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

  /**
   * 上级部门数据绑定事件
   *
   * @param event
   */
  parentDepartmentDataBound(event: DdtDataBoundEventArgs): void {
    if (this.form) {
      this.form.patchValue({ parentId: this.isAdd ? this.parentId : this.formData?.parentId });
      this.parentDepartmentId = [this.form.value.parentId?.toString() || ''];
    }
  }

  // ----------------------------------------------------------------------------
  // @ 私有方法
  // ----------------------------------------------------------------------------

  /**
   * 组织表单验证
   *
   * @returns
   */
  private _formVerify(): boolean {
    // 上级部门字段处理
    if (this.parentDepartmentId) {
      const parentId = isUndefined(this.parentDepartmentId[0]) ? null : +this.parentDepartmentId[0];
      this.form.patchValue({ parentId });

      if (this.beforeEditData && this.beforeEditData.parentId !== parentId) {
        this.form.get('parentId').markAsDirty();
      }
    }

    // 数据验证
    if (this.form.invalid) {
      const parentIdControl = this.form.get('parentId');
      const nameControl = this.form.get('name');

      if (parentIdControl.hasError('required')) {
        this.parentDepartment.showPopup();
        this._wsMessageService.toast('warning', '请选择上级部门');
      } else if (nameControl.hasError('required')) {
        this.departmentsName.focusIn();
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
    this.beforeEditData = null;
    this.form.patchValue({
      parentId: null,
      code: null,
      name: null,
      description: null,
      status: true,
    });
  }
}
