import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MultiSelectAllModule, MultiSelectComponent } from '@syncfusion/ej2-angular-dropdowns';
import { ButtonPropsModel, DialogAllModule, DialogComponent } from '@syncfusion/ej2-angular-popups';
import { WsDividerComponent } from '@ws/components/divider';
import { DialogProvider, GropDownListProvider } from '@ws/providers';
import { WsMessageService } from '@ws/services/message';
import { WsDialogService } from '@ws/services/utils';
import { RoleModel, RolesService } from 'app/core/systems/roles';
import { IColumnUserModel, UsersService } from 'app/core/systems/users';
import { isUndefined } from 'lodash-es';
import { DataTableModule, DropDownModule, IconModule, LoadingModule } from 'ng-devui';
import { TableWidthConfig } from 'ng-devui/data-table';
import { finalize } from 'rxjs';
import { DropDownListData } from './user-role-items.columns';

@Component({
  selector: 'user-role-items',
  templateUrl: './user-role-items.component.html',
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
    MultiSelectAllModule,
  ],
})
export class UserRoleItemsComponent implements OnInit {
  /** 用户数据 */
  @Input() userData: IColumnUserModel;

  /** 表格名称 */
  tableName = '角色';

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

  /** 角色列表数据 */
  @ViewChild('roleLists') roleLists: MultiSelectComponent;
  roleDatas: DropDownListData[];
  //#endregion

  /**
   * 构造函数
   */
  constructor(
    public dialogProvider: DialogProvider,
    public gropDownListProvider: GropDownListProvider,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private _usersService: UsersService,
    private _rolesService: RolesService,
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

    /** 添加角色弹窗按钮 */
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
      roles: [[], Validators.required],
    });

    if (!isUndefined(this.userData.id)) {
      /** 初始化角色列表数据 */
      this.initUserRolesData();

      /** 初始化角色多选下拉列表数据 */
      this.initUserRoleListsData();
    }
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 初始化角色列表数据
   */
  initUserRolesData(): void {
    this.showLoading = true;
    this._usersService.getRoles(this.userData.id).subscribe(roles => {
      this.tableData = roles.map(({ id, code, name, description }) => ({
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
   * 初始化角色多选下拉列表数据
   */
  initUserRoleListsData(): void {
    this._rolesService.getData().subscribe(data => {
      this.roleDatas = data.result.map(({ id, code, name, description }) => ({
        id,
        code,
        name,
        description,
      }));
    });
  }

  /**
   * 添加角色弹窗
   */
  add(): void {
    this.addDialog.show();
  }

  /**
   * 添加角色保存
   */
  addSave(): void {
    // 数据验证
    if (this.addDialogForm.invalid) {
      const rolesControl = this.addDialogForm.get('roles');

      if (rolesControl.hasError('required')) {
        this.roleLists.showPopup();
        this._wsMessageService.toast('warning', '请选择角色');
      }
    } else {
      const roleIds = <number[]>this.roleLists.value;

      // 设置角色
      this._usersService.setRoles({ userId: this.userData.id, roleIds }).subscribe({
        next: () => {
          this.addDialogForm.reset();
          this.addDialog.hide();
          this.initUserRolesData();
        },
      });
    }
  }

  /**
   * 添加角色弹窗打开事件
   *
   * @param args
   */
  addDialogOpen(args: object): void {
    // 多选下拉赋值
    const roles = this.tableData.map(item => item.id);
    this.addDialogForm.patchValue({ roles });
  }

  /**
   * 移除角色
   *
   * @param role
   */
  removeRole(role: RoleModel): void {
    const confirmDialog = this._wsDialogService.confirm('warning', {
      title: `确定撤销『${role.name}』角色？`,
      content: '撤销角色将会使该用户失去此角色的所有权限',
      okButton: {
        click: () => {
          // 移除角色
          this._usersService
            .removeRole({ userIds: [this.userData.id], roleId: role.id })
            .pipe(finalize(() => confirmDialog.hide()))
            .subscribe({
              next: () => this.initUserRolesData(),
            });
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
