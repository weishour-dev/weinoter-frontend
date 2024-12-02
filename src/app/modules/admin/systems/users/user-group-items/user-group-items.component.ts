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
import { UserGroup, UserGroupsService } from 'app/core/systems/user-groups';
import { IColumnUserModel, UsersService } from 'app/core/systems/users';
import { isUndefined } from 'lodash-es';
import { DataTableModule, DropDownModule, IconModule, LoadingModule } from 'ng-devui';
import { TableWidthConfig } from 'ng-devui/data-table';
import { finalize } from 'rxjs';
import { DropDownListData } from './user-group-items.columns';

@Component({
  selector: 'user-group-items',
  templateUrl: './user-group-items.component.html',
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
export class UserGroupItemsComponent implements OnInit {
  /** 用户数据 */
  @Input() userData: IColumnUserModel;

  /** 表格名称 */
  tableName = '用户组';

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

  /** 用户组列表数据 */
  @ViewChild('userGroupLists') userGroupLists: MultiSelectComponent;
  userGroupDatas: DropDownListData[];
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
    private _userGroupsService: UserGroupsService,
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

    /** 添加用户组弹窗按钮 */
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
      userGroups: [[], Validators.required],
    });

    if (!isUndefined(this.userData.id)) {
      /** 初始化用户组列表数据 */
      this.initUserGroupsData();

      /** 初始化用户组多选下拉列表数据 */
      this.initUserGroupListsData();
    }
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 初始化用户组列表数据
   */
  initUserGroupsData(): void {
    this.showLoading = true;
    this._usersService.getUserGroups(this.userData.id).subscribe(userGroups => {
      this.tableData = userGroups.map(({ id, code, name, description }) => ({
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
   * 初始化用户组多选下拉列表数据
   */
  initUserGroupListsData(): void {
    this._userGroupsService.getData().subscribe(data => {
      this.userGroupDatas = data.result.map(({ id, code, name, description }) => ({
        id,
        code,
        name,
        description,
      }));
    });
  }

  /**
   * 添加用户组弹窗
   */
  add(): void {
    this.addDialog.show();
  }

  /**
   * 添加用户组保存
   */
  addSave(): void {
    // 数据验证
    if (this.addDialogForm.invalid) {
      const userGroupsControl = this.addDialogForm.get('userGroups');

      if (userGroupsControl.hasError('required')) {
        this.userGroupLists.showPopup();
        this._wsMessageService.toast('warning', '请选择用户组');
      }
    } else {
      const groupIds = <number[]>this.userGroupLists.value;

      // 设置用户组
      this._usersService.setUserGroups({ userId: this.userData.id, groupIds }).subscribe({
        next: () => {
          this.addDialogForm.reset();
          this.addDialog.hide();
          this.initUserGroupsData();
        },
      });
    }
  }

  /**
   * 添加用户组弹窗打开事件
   *
   * @param args
   */
  addDialogOpen(args: object): void {
    // 多选下拉赋值
    const userGroups = this.tableData.map(item => item.id);
    this.addDialogForm.patchValue({ userGroups });
  }

  /**
   * 移除用户组
   *
   * @param userGroup
   */
  removeGroup(userGroup: UserGroup): void {
    const confirmDialog = this._wsDialogService.confirm('warning', {
      title: `确定撤销『${userGroup.name}』用户组？`,
      content: '撤销用户组将会使该用户失去此用户组的所有权限',
      okButton: {
        click: () => {
          // 移除用户组
          this._usersService
            .removeUserGroup({ userIds: [this.userData.id], groupId: userGroup.id })
            .pipe(finalize(() => confirmDialog.hide()))
            .subscribe({
              next: () => this.initUserGroupsData(),
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
