import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DdtDataBoundEventArgs, DropDownTreeAllModule, DropDownTreeComponent } from '@syncfusion/ej2-angular-dropdowns';
import { ButtonPropsModel, DialogAllModule, DialogComponent } from '@syncfusion/ej2-angular-popups';
import { WsDividerComponent } from '@ws/components/divider';
import { DialogProvider, GropDownTreeProvider } from '@ws/providers';
import { WsMessageService } from '@ws/services/message';
import { WsDialogService } from '@ws/services/utils';
import { Department, DepartmentsService } from 'app/core/systems/departments';
import { IColumnUserModel, UsersService } from 'app/core/systems/users';
import { isUndefined } from 'lodash-es';
import { DataTableModule, DropDownModule, IconModule, LoadingModule } from 'ng-devui';
import { TableWidthConfig } from 'ng-devui/data-table';
import { finalize } from 'rxjs';

@Component({
  selector: 'user-department-items',
  templateUrl: './user-department-items.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    WsDividerComponent,
    IconModule,
    DataTableModule,
    LoadingModule,
    DropDownModule,
    DialogAllModule,
    DropDownTreeAllModule,
  ],
})
export class UserDepartmentItemsComponent implements OnInit, AfterViewInit {
  /** 用户数据 */
  @Input() userData: IColumnUserModel;

  /** 表格名称 */
  tableName = '部门';

  /** 表格loading */
  showLoading = false;

  /** 表格数据 */
  tableData = [];

  /** 配置表格的字段 */
  dataTableOptions;

  /** 配置表格的列宽 */
  tableWidthConfig: TableWidthConfig[] = [];

  //#region 弹窗
  /** 批量新增弹窗 */
  @ViewChild('addDialog') addDialog: DialogComponent;
  addDlgButtons: ButtonPropsModel[];

  /** 弹窗表单 */
  addDialogForm: FormGroup;

  /** 部门列表数据 */
  @ViewChild('departmentTreeLists') departmentTreeLists: DropDownTreeComponent;
  /** 部门id */
  departmentId: string[] = [];
  departmentDatas: Department[];
  //#endregion

  /**
   * 构造函数
   */
  constructor(
    public dialogProvider: DialogProvider,
    public gropDownTreeProvider: GropDownTreeProvider,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private _usersService: UsersService,
    private _departmentsService: DepartmentsService,
    private _wsMessageService: WsMessageService,
    private _wsDialogService: WsDialogService,
  ) {}

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 视图初始化后
   */
  ngOnInit(): void {
    /** 配置表格的字段 */
    this.dataTableOptions = {
      columns: [
        {
          field: 'name',
          header: '名称',
          fieldType: 'text',
        },
        {
          field: 'description',
          header: '描述',
          fieldType: 'text',
        },
      ],
    };

    /** 配置表格的列宽 */
    this.tableWidthConfig = [
      {
        field: 'name',
        width: '100px',
      },
      {
        field: 'description',
        width: '500px',
      },
      {
        field: 'options',
        width: '60px',
      },
    ];

    /** 添加部门弹窗按钮 */
    this.addDlgButtons = [
      {
        buttonModel: this.dialogProvider.cancelButton,
        click: () => this.addDialog.hide(),
      },
      {
        buttonModel: this.dialogProvider.saveButton,
        click: () => this.addSave(),
      },
    ];

    /** 初始化表单 */
    this.addDialogForm = this._formBuilder.group({
      departmentIds: [[], Validators.required],
    });

    if (!isUndefined(this.userData.id)) {
      /** 初始化部门列表数据 */
      this.initUserDepartmentsData();

      /** 初始化部门多选下拉列表数据 */
      this.initUserDepartmentListsData();
    }
  }

  /**
   * 视图初始化后
   */
  ngAfterViewInit(): void {
    setTimeout(() => {
      // 下拉树默认设置
      this.gropDownTreeProvider.defaultHandle(this.departmentTreeLists);
    });
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 初始化部门列表数据
   */
  initUserDepartmentsData(): void {
    this.showLoading = true;
    this._usersService.getDepartments(this.userData.id).subscribe(departments => {
      this.tableData = departments.map(({ id, code, name, description }) => ({
        id,
        code,
        name,
        description,
      }));

      this.showLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * 初始化部门多选下拉列表数据
   */
  initUserDepartmentListsData(): void {
    this._departmentsService.getAll({ isSelected: false }).subscribe(departments => {
      this.departmentDatas = departments;
    });
  }

  /**
   * 添加部门弹窗
   */
  add(): void {
    this.addDialog.show();
  }

  /**
   * 添加部门保存
   */
  addSave(): void {
    // 部门字段处理
    if (this.departmentId) {
      const departmentIds = isUndefined(this.departmentId[0]) ? null : +this.departmentId[0];
      this.addDialogForm.patchValue({ departmentIds });
    }

    // 数据验证
    if (this.addDialogForm.invalid) {
      const departmentIdsControl = this.addDialogForm.get('departmentIds');

      if (departmentIdsControl.hasError('required')) {
        this.departmentTreeLists.showPopup();
        this._wsMessageService.toast('warning', '请选择部门');
      }
    } else {
      const departmentIds = this.departmentId.map(id => +id);

      // 设置部门
      this._usersService.setDepartments({ userId: this.userData.id, departmentIds }).subscribe({
        next: () => {
          this.addDialogForm.reset();
          this.addDialog.hide();
          this.initUserDepartmentsData();
        },
      });
    }
  }

  /**
   * 部门数据绑定事件
   *
   * @param event
   */
  departmentDataBound(event: DdtDataBoundEventArgs): void {
    if (this.addDialogForm) {
      this.departmentId = [this.addDialogForm.value.departmentIds?.toString() || ''];
    }
  }

  /**
   * 添加部门弹窗打开事件
   *
   * @param args
   */
  addDialogOpen(args: object): void {
    // 多选下拉赋值
    const departmentIds = this.tableData.map(item => item.id);
    this.departmentId = departmentIds.map(id => id.toString());
    this.addDialogForm.patchValue({ departmentIds });
  }

  /**
   * 移除部门
   *
   * @param department
   */
  removeDepartment(department: Department): void {
    const confirmDialog = this._wsDialogService.confirm('warning', {
      title: `确定撤销『${department.name}』部门？`,
      content: '撤销部门将会使该用户失去此部门的所有权限',
      okButton: {
        click: () => {
          // 移除部门
          this._usersService
            .removeDepartment({ userIds: [this.userData.id], departmentId: department.id })
            .pipe(finalize(() => confirmDialog.hide()))
            .subscribe(() => this.initUserDepartmentsData());
        },
      },
    });
  }

  /**
   * 下拉状态
   *
   * @param event
   */
  onToggle(event: boolean): void {}
}
