import { NgClass } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import {
  DataBoundEventArgs,
  ListBoxAllModule,
  ListBoxChangeEventArgs,
  ListBoxComponent,
} from '@syncfusion/ej2-angular-dropdowns';
import {
  DataStateChangeEventArgs,
  DialogEditEventArgs,
  GridAllModule,
  GridComponent,
  RowDragEventArgs,
  SaveEventArgs,
} from '@syncfusion/ej2-angular-grids';
import { TextBoxAllModule, TextBoxComponent } from '@syncfusion/ej2-angular-inputs';
import { ClickEventArgs, ItemModel, ToolbarAllModule } from '@syncfusion/ej2-angular-navigations';
import { select } from '@syncfusion/ej2-base';
import { DataManager } from '@syncfusion/ej2-data';
import { wsAnimations } from '@ws/animations';
import { WsMultipleListComponent } from '@ws/components/multiple';
import { WsResultComponent } from '@ws/components/result';
import { WsScrollbarDirective } from '@ws/directives/scrollbar';
import { FormActionArgs, FormActionType, ListData, ListDataSource } from '@ws/interfaces';
import { DialogProvider, GridProvider, GropDownListProvider, ListBoxProvider } from '@ws/providers';
import { WsMessageService } from '@ws/services/message';
import { WsDialogService, WsUtilsService } from '@ws/services/utils';
import { MandateTargetType } from 'app/core/constants';
import { UserGroup, UserGroupsService } from 'app/core/systems/user-groups';
import { IColumnUserModel, User, UsersService } from 'app/core/systems/users';
import { WsHeaderComponent } from 'app/layout/common/header';
import { PermissionAllocationComponent } from 'app/modules/admin/systems/permissions/permission-allocation';
import { UserGroupFormComponent } from 'app/modules/admin/systems/user-groups/user-group-form';
import { UserDepartmentItemsComponent } from 'app/modules/admin/systems/users/user-department-items';
import { UserGroupItemsComponent } from 'app/modules/admin/systems/users/user-group-items';
import { UserRoleItemsComponent } from 'app/modules/admin/systems/users/user-role-items';
import { cloneDeep, filter, remove } from 'lodash-es';
import { DropDownModule, IconModule, SplitterComponent, SplitterModule, TabsModule } from 'ng-devui';
import { Observable, finalize, forkJoin } from 'rxjs';

@Component({
  selector: 'systems-user-groups',
  templateUrl: './user-groups.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: wsAnimations,
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    ReactiveFormsModule,
    WsHeaderComponent,
    MatIconModule,
    SplitterModule,
    ToolbarAllModule,
    MatDividerModule,
    ListBoxAllModule,
    WsScrollbarDirective,
    DropDownModule,
    IconModule,
    WsResultComponent,
    GridAllModule,
    TabsModule,
    TextBoxAllModule,
    UserDepartmentItemsComponent,
    UserGroupItemsComponent,
    UserRoleItemsComponent,
    UserGroupFormComponent,
    WsMultipleListComponent,
    PermissionAllocationComponent,
  ],
})
export class SystemsUserGroupsComponent implements OnInit {
  @ViewChild('systemsUserGroupsSplitter') systemsUserGroupsSplitter: SplitterComponent;
  @ViewChild('listbox') listbox: ListBoxComponent;
  @ViewChild('userGroupForm') userGroupForm: UserGroupFormComponent;
  @ViewChild('permissionAllocation') permissionAllocation: PermissionAllocationComponent;
  @ViewChild('userMultipleList') userMultipleList: WsMultipleListComponent;
  @ViewChild('systemsUsersGrid') systemsUsersGrid: GridComponent;
  @ViewChild('usersUsername') usersUsername: TextBoxComponent;
  @ViewChild('usersEmail') usersEmail: TextBoxComponent;
  @ViewChild('usersPassword') usersPassword: TextBoxComponent;

  /** 当前选中的用户组 */
  userGroupActiveId = 0;
  userGroupActive: UserGroup;

  /** 用户组列表数据 */
  listboxData: UserGroup[] = [];

  //#region 用户组表单
  /** 表单操作类别 */
  userGroupFormActionType: FormActionType;
  /** 表单数据 */
  userGroupFormData: UserGroup;
  //#endregion

  /** 用户弹窗名称 */
  systemsUsersDialogName = '用户';
  /** 用户表格id */
  systemsUsersGridId = 'systems_users_grid';
  /** 用户表格数据 */
  systemsUsersData: DataManager;
  /** 用户表单 */
  systemsUsersForm: FormGroup;
  /** 选择成员数据 */
  userMultipleData: ListData<User>[];

  /** 授权目标对象类型 */
  targetType = MandateTargetType.GROUP;
  /** 授权目标对象id */
  targetId: number;

  /**
   * 构造函数
   */
  constructor(
    public listBoxProvider: ListBoxProvider,
    public gridProvider: GridProvider,
    public gropDownListProvider: GropDownListProvider,
    public dialogProvider: DialogProvider,
    private _formBuilder: FormBuilder,
    private _userGroupsService: UserGroupsService,
    private _usersService: UsersService,
    private _wsMessageService: WsMessageService,
    private _wsUtilsService: WsUtilsService,
    private _wsDialogService: WsDialogService,
  ) {}

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    // 加载用户组列表数据
    this.initSystemsUserGroupsData();
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 用户表格创建完成事件
   *
   * @param args
   */
  systemsUsersGridCreated(args: object): void {
    this.gridProvider.created(args, this.systemsUsersGrid);

    // 表格默认设置
    this.gridProvider.defaultHandle(this.systemsUsersGrid);

    // 工具栏自定义处理
    this.systemsUsersGrid.toolbar = <ItemModel[]>cloneDeep(this.gridProvider.toolbar);
    const toolbar = <ItemModel[]>cloneDeep(this.systemsUsersGrid.toolbar);
    toolbar.splice(2, 0, {
      text: '授权',
      tooltipText: '授权',
      prefixIcon: 'icon-set-permission text-green-500',
      id: 'auth',
    });
    this.systemsUsersGrid.toolbar = toolbar.map(button => {
      switch (button.text) {
        case 'Add':
          button = { ...button, id: 'add', text: '添加', tooltipText: '添加' };
          break;
        case 'Delete':
          button = { ...button, id: 'remove', text: '移除', tooltipText: '移除' };
          break;
      }
      return button;
    });
    setTimeout(() => this.gridProvider.toolbarHandle(this.systemsUsersGrid, 'text'));

    // 开启拖动
    this.systemsUsersGrid.allowRowDragAndDrop = false;
  }

  /**
   * 初始化用户组列表数据
   */
  initSystemsUserGroupsData(message: string = ''): void {
    // 用户组列表数据
    const state: DataStateChangeEventArgs = {};
    this._userGroupsService.getData(state).subscribe(data => {
      this.listboxData = data.result;

      // 消息提示
      if (message !== '') this._wsMessageService.toast('success', message);
    });
  }

  /**
   * 分割折叠展开事件
   */
  splitterToggleClick(): void {
    const nativeElement = this.systemsUserGroupsSplitter['el'].nativeElement;
    const devuiCollapse = select('.devui-collapse', nativeElement);
    devuiCollapse?.click();
  }

  /**
   * 新增操作
   *
   * @param type
   */
  addOperations(): void {
    this.userGroupFormData = null;
    this.userGroupFormActionType = 'add';
    this.userGroupForm.formDialog.show();
  }

  // ----------------------------------------------------------------------------
  // @ 用户组列表
  // ----------------------------------------------------------------------------

  /**
   * 列表数据绑定事件
   *
   * @param args
   */
  listboxDataBound(args: DataBoundEventArgs): void {
    setTimeout(() => {
      const items = <UserGroup[]>(<unknown>args.items);
      if (items.length === 0) return;

      this.listBoxProvider.dataBound(args, this.listbox);

      // 默认选中第一项
      if (this.userGroupActiveId === 0) {
        this.listbox.selectAll(false);
        this.listbox.selectItems([items[0].name]);

        this.userGroupActiveId = items[0].id;
        this.userGroupActive = items[0];
      }

      // 更新用户列表
      this.initSystemsUsersData();
    });
  }

  /**
   * 用户组选择列表变化事件
   *
   * @param args
   */
  listBoxChange(args: ListBoxChangeEventArgs): void {
    if (args.event) {
      this.userGroupActiveId = <number>args.value[0];
      this.userGroupActive = <UserGroup>args.items[0];
    }

    // 更新用户列表
    this.initSystemsUsersData();
  }

  /**
   * 列表工具栏点击事件
   *
   * @param args
   */
  listboxToolbarClick(args: ClickEventArgs): void {
    const id = this.userGroupActiveId;

    switch (args.item.id) {
      case 'add':
        this.userGroupFormData = null;
        this.userGroupFormActionType = 'add';
        this.userGroupForm.formDialog.show();
        break;
      case 'auth':
        this.allocation(id);
        break;
      case 'delete':
        this.userGroupDelete(id);
        break;
      case 'refresh':
        this.userGroupActiveId = 0;
        this.initSystemsUserGroupsData('用户组刷新成功');
        break;
    }
  }

  /**
   * 用户组列表操作
   *
   * @param listData
   * @param type
   */
  listOperations(listData: UserGroup, type: string): void {
    const id = listData.id;

    switch (type) {
      case 'auth':
        this.allocation(id);
        break;
      case 'edit':
        this.userGroupFormData = listData;
        this.userGroupFormActionType = 'edit';
        this.userGroupForm.formDialog.show();
        break;
      case 'delete':
        this.userGroupDelete(id);
        break;
      case 'enable':
        this.userGroupEnableOrDisable(id, true);
        break;
      case 'disable':
        this.userGroupEnableOrDisable(id, false);
        break;
    }
  }

  // ----------------------------------------------------------------------------
  // @ 用户组表单
  // ----------------------------------------------------------------------------

  /**
   * 删除用户组
   *
   * @param id
   */
  userGroupDelete(id: number): void {
    if (id === 0) {
      this._wsMessageService.toast('error', '没有为删除操作选择记录');
      return;
    }

    const name = this.userGroupActive.name;
    const confirmDialog = this._wsDialogService.confirm('error', {
      title: `确定删除『${name}』用户组吗？`,
      content: '删除后将无法恢复，请谨慎操作！',
      okButton: {
        click: () => {
          this._userGroupsService
            .remove({ id })
            .pipe(finalize(() => confirmDialog.hide()))
            .subscribe({
              next: data => {
                remove(this.listboxData, item => item.id === id);
                this.listbox.removeItem(this.listbox.getDataByValue(id));

                // 删除后选中处理
                if (this.listboxData.length === 0) {
                  this.userGroupActiveId = 0;
                  this.systemsUsersData = this._usersService.getDataManager([]);
                } else {
                  this.userGroupActiveId = this.listboxData[0].id;
                  this.userGroupActive = this.listboxData[0];

                  this.listbox.selectAll(false);
                  this.listbox.selectItems([this.listboxData[0].name]);
                }
              },
            });
        },
      },
    });
  }

  /**
   * 启用|禁用用户组
   *
   * @param id
   */
  userGroupEnableOrDisable(id: number, status: boolean): void {
    if (id === 0) {
      const actionName = status ? '启用' : '禁用';
      this._wsMessageService.toast('error', `没有为${actionName}操作选择记录`);
      return;
    }

    this._userGroupsService.enableOrDisable({ ids: [id], status }).subscribe(() => this.initSystemsUserGroupsData());
  }

  /**
   * 用户组表单操作成功事件
   *
   * @param args
   */
  userGroupFormActionSuccess(args: FormActionArgs): void {
    const data = <UserGroup>args.data;

    switch (args.actionType) {
      case 'add':
        this.listboxData.push(data);
        this.listbox?.addItem([data as unknown as ListDataSource]);
        this.listbox && this.listBoxProvider.styleHandle(this.listbox);
        break;
      case 'edit':
        this.listboxData = this.listboxData.map(item => {
          if (item.id === data.id) {
            return { ...item, ...data };
          } else {
            return item;
          }
        });
        break;
    }
  }

  // ----------------------------------------------------------------------------
  // @ 选择成员
  // ----------------------------------------------------------------------------

  // 加载选择成员数据
  loadUserMultipleData(): void {
    this._usersService.getData().subscribe(data => {
      const filterList = filter(data.result, user => {
        const userGroupIds = user.userGroups.map(userGroup => userGroup.id);
        return !userGroupIds?.includes(this.userGroupActiveId);
      });

      this.userMultipleData = filterList.map(user => {
        const id = user.id;
        const name = user.username;
        const userGroupNames = user.userGroups?.map(userGroup => {
          return this.listboxData.find(item => item.id === userGroup.id)?.name;
        });
        const description = userGroupNames?.join('、');
        return { id, name, description, data: user };
      }) as ListData<User>[];
    });
  }

  /**
   * 选择成员确认事件
   *
   * @param userIds
   */
  userMultipleConfirm(userIds: number[]): void {
    const subjects: Observable<string>[] = [];

    for (const userId of userIds) {
      const groupIds: number[] = [];

      // 获取用户拥有的用户组id并附加上当前选择的用户组id
      for (const multipleData of this.userMultipleData) {
        const user = multipleData.data;
        if (userId === user.id) {
          groupIds.push(...user.userGroups.map(userGroup => userGroup.id), this.userGroupActiveId);
        }
      }

      subjects.push(this._usersService.setUserGroups({ userId, groupIds }, false));
    }

    // 批量成员设置用户组
    forkJoin(subjects).subscribe(() => {
      this._wsMessageService.toast('success', '添加成员成功');
      this.initSystemsUsersData();
    });
  }

  // ----------------------------------------------------------------------------
  // @ 授权
  // ----------------------------------------------------------------------------

  /**
   * 分配
   *
   * @param id
   * @param type
   */
  allocation(id: number, type = MandateTargetType.GROUP): void {
    if (id > 0) {
      this.targetType = type;
      this.targetId = id;
      this.permissionAllocation.dialog.show();
    } else {
      this._wsMessageService.toast('error', '没有为授权操作选择记录');
    }
  }

  /**
   * 授权确认事件
   */
  allocationConfirm(): void {
    switch (this.targetType) {
      case MandateTargetType.USER:
        this.initSystemsUsersData();
        break;
    }
  }

  // ----------------------------------------------------------------------------
  // @ 用户表格
  // ----------------------------------------------------------------------------

  // 初始化数据
  initSystemsUsersData(message: string = ''): void {
    // 获取表格数据
    if (this.userGroupActiveId > 0) {
      this._userGroupsService.getUsers(this.userGroupActiveId).subscribe(users => {
        this.systemsUsersData = this._usersService.getDataManager(users);

        if (message !== '') this._wsMessageService.toast('success', message);
      });
    }
  }

  /**
   * 操作开始
   *
   * @param args
   */
  systemsUsersActionBegin(args: SaveEventArgs): void {
    if (['add', 'beginEdit'].includes(args.requestType)) {
      // 新增之前
      if (args.requestType === 'add') {
      }
      // 修改之前
      else {
      }
      this.systemsUsersForm = this.createFormGroup(args.rowData);
    }

    if (args.requestType === 'save') {
      if (this._systemsUsersFormVerify()) {
        let data = {};
        if (args.action === 'add') {
          const rowsCount = this.systemsUsersGrid.getRowsObject().length;
          data = { sort: rowsCount + 1, ...this.systemsUsersForm.value };
        } else {
          data = this.systemsUsersForm.value;
        }
        args.data = data;
      } else {
        args.cancel = true;
      }
    }
  }

  /**
   * 操作完成
   *
   * @param args
   */
  systemsUsersActionComplete(args: DialogEditEventArgs | SaveEventArgs): void {
    const isComplete = args.type === 'actionComplete';

    if (this._wsUtilsService.isProps<SaveEventArgs>(args, 'action')) {
      // 新增完成
      if (args.action === 'add' && isComplete) {
      }
      // 修改完成
      else if (args.action === 'edit' && isComplete) {
      }
    } else if (this._wsUtilsService.isProps<DialogEditEventArgs>(args, 'dialog')) {
      const dialog = args.dialog;
      const header =
        args.requestType === 'add'
          ? `新增${this.systemsUsersDialogName}`
          : `修改「${args.rowData['username']}」${this.systemsUsersDialogName}`;

      dialog && this.gridProvider.dialogHandle(dialog, header);
    }

    switch (args.requestType) {
      case 'columnstate':
        // 自动调整所有列
        this.systemsUsersGrid.autoFitColumns();
        break;
    }

    if (['save', 'delete', 'cancel'].includes(args.requestType)) {
      this.initSystemsUsersData();
    }
  }

  /**
   * 工具栏点击事件
   *
   * @param args
   */
  systemsUsersToolbarClick(args: ClickEventArgs): void {
    this.gridProvider.defaultToolbarClick(args, this.systemsUsersGridId, this.systemsUsersGrid);

    const records: IColumnUserModel[] = this.systemsUsersGrid.getSelectedRecords();

    switch (args.item.id) {
      // 添加成员
      case 'add':
        if (this.userGroupActiveId === 0) {
          const alertDialog = this._wsDialogService.alert('warning', {
            title: `添加失败`,
            content: '请先添加用户组，再进行添加成员操作。',
            okButton: {
              click: () => alertDialog.hide(),
            },
          });
          return;
        }

        this.loadUserMultipleData();
        this.userMultipleList.dialog.show();
        break;
      // 授权成员
      case 'auth':
        if (records.length > 0) {
          this.allocation(records[0].id, MandateTargetType.USER);
        } else {
          this._wsDialogService.gridAlert('没有为授权操作选择记录', this.systemsUsersGrid.element);
        }
        break;
      // 移除成员
      case 'remove':
        if (records.length > 0) {
          const userIds = records.map(record => record.id);
          const groupId = this.userGroupActiveId;
          const userGroupName = this.userGroupActive.name;

          const confirmDialog = this._wsDialogService.confirm('warning', {
            title: `确定从『${userGroupName}』用户组移除？`,
            content: '撤销用户组将会使该用户失去此用户组的所有权限',
            okButton: {
              click: () => {
                // 移除成员
                this._usersService
                  .removeUserGroup({ userIds, groupId })
                  .pipe(finalize(() => confirmDialog.hide()))
                  .subscribe(() => {
                    this.initSystemsUsersData();
                  });
              },
            },
          });
        } else {
          this._wsDialogService.gridAlert('没有为移除操作选择记录', this.systemsUsersGrid.element);
        }
        break;
      case 'refresh':
        this.initSystemsUsersData('成员刷新成功');

        // 清除过滤
        this.systemsUsersGrid.clearFiltering();
        // 清除排序
        this.systemsUsersGrid.clearSorting();
        break;
    }
  }

  /**
   * 拖动到目标事件
   *
   * @param args
   */
  systemsUsersRowDrop(args: RowDragEventArgs): void {
    args.cancel = true;

    const value = [];
    for (let r = 0; r < args.rows.length; r++) {
      value.push(args.fromIndex + r);
    }

    // 当拖动位置发生变化时
    if (value[0] !== args.dropIndex) {
      this.systemsUsersGrid.reorderRows(value, args.dropIndex);

      setTimeout(() => {
        const currentRows = this.systemsUsersGrid.getCurrentViewRecords();
        const ids = currentRows.map(currentRow => currentRow['id']);

        // 调整用户排序
        this._usersService.sort({ ids }).subscribe();
      });
    }
  }

  // ----------------------------------------------------------------------------
  // @ 其他
  // ----------------------------------------------------------------------------

  /**
   * 创建表单
   *
   * @param data
   * @returns
   */
  createFormGroup(data: IColumnUserModel): FormGroup {
    return this._formBuilder.group({
      id: [data.id],
      username: [data.username, Validators.required],
      nickname: [data.nickname || ''],
      email: [data.email, [Validators.required, Validators.email]],
      password: [data.password, Validators.required],
      about: [data.about],
    });
  }

  // ----------------------------------------------------------------------------
  // @ 私有方法
  // ----------------------------------------------------------------------------

  /**
   * 用户表单验证
   *
   * @returns
   */
  private _systemsUsersFormVerify(): boolean {
    // 数据验证
    if (this.systemsUsersForm.invalid) {
      const usernameControl = this.systemsUsersForm.get('username');
      const passwordControl = this.systemsUsersForm.get('password');
      const emailControl = this.systemsUsersForm.get('email');

      if (usernameControl.hasError('required')) {
        this.usersUsername.focusIn();
        this._wsMessageService.toast('warning', '请选择用户名!');
      } else if (passwordControl.hasError('required')) {
        this.usersPassword.focusIn();
        this._wsMessageService.toast('warning', '请输入密码!');
      } else if (emailControl.hasError('required')) {
        this.usersEmail.focusIn();
        this._wsMessageService.toast('warning', '请输入邮箱!');
      } else if (emailControl.hasError('email')) {
        this.usersEmail.focusIn();
        this._wsMessageService.toast('warning', '请输入正确的邮箱!');
      }

      return false;
    }

    // 数据是否修改过
    if (!this.systemsUsersForm.dirty) {
      this._wsMessageService.toast('warning', '暂无提交修改的数据!');
      return false;
    }

    return true;
  }
}
