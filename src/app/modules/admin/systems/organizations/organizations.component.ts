import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Button } from '@syncfusion/ej2-angular-buttons';
import {
  DataStateChangeEventArgs,
  DialogEditEventArgs,
  GridAllModule,
  GridComponent,
  RowDragEventArgs,
  SaveEventArgs,
} from '@syncfusion/ej2-angular-grids';
import { TextBoxAllModule, TextBoxComponent } from '@syncfusion/ej2-angular-inputs';
import {
  ClickEventArgs,
  DataBoundEventArgs,
  FieldsSettingsModel,
  ItemModel,
  NodeExpandEventArgs,
  NodeSelectEventArgs,
  ToolbarAllModule,
  TreeViewAllModule,
  TreeViewComponent,
} from '@syncfusion/ej2-angular-navigations';
import { select } from '@syncfusion/ej2-base';
import { DataManager, Predicate, Query } from '@syncfusion/ej2-data';
import { wsAnimations } from '@ws/animations';
import { WsMultipleListComponent } from '@ws/components/multiple';
import { WsResultComponent } from '@ws/components/result';
import { WsScrollbarDirective } from '@ws/directives/scrollbar';
import { FormActionArgs, FormActionType, ListData, ListDataSource } from '@ws/interfaces';
import { DialogProvider, GridProvider, GropDownListProvider, TreeViewProvider } from '@ws/providers';
import { WsMessageService } from '@ws/services/message';
import { WsDialogService, WsUtilsService } from '@ws/services/utils';
import { MandateTargetType } from 'app/core/constants';
import { Department, DepartmentsService } from 'app/core/systems/departments';
import { OrganizationsService } from 'app/core/systems/organizations';
import { IColumnUserModel, UsersService } from 'app/core/systems/users';
import { WsHeaderComponent } from 'app/layout/common/header';
import { DepartmentFormComponent } from 'app/modules/admin/systems/organizations/department-form';
import { OrganizationFormComponent } from 'app/modules/admin/systems/organizations/organization-form';
import { PermissionAllocationComponent } from 'app/modules/admin/systems/permissions/permission-allocation';
import { UserDepartmentItemsComponent } from 'app/modules/admin/systems/users/user-department-items';
import { UserGroupItemsComponent } from 'app/modules/admin/systems/users/user-group-items';
import { UserRoleItemsComponent } from 'app/modules/admin/systems/users/user-role-items';
import { cloneDeep, filter, find, remove } from 'lodash-es';
import { DropDownModule, IconModule, SearchModule, SplitterComponent, SplitterModule, TabsModule } from 'ng-devui';
import { finalize } from 'rxjs';

@Component({
  selector: 'systems-organizations',
  templateUrl: './organizations.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: wsAnimations,
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    WsHeaderComponent,
    MatIconModule,
    SplitterModule,
    ToolbarAllModule,
    DropDownModule,
    MatDividerModule,
    SearchModule,
    TreeViewAllModule,
    WsScrollbarDirective,
    IconModule,
    WsResultComponent,
    GridAllModule,
    TabsModule,
    TextBoxAllModule,
    UserDepartmentItemsComponent,
    UserGroupItemsComponent,
    UserRoleItemsComponent,
    OrganizationFormComponent,
    DepartmentFormComponent,
    PermissionAllocationComponent,
    WsMultipleListComponent,
  ],
})
export class SystemsOrganizationsComponent implements OnInit {
  @ViewChild('systemsDepartmentsSplitter') systemsDepartmentsSplitter: SplitterComponent;
  @ViewChild('systemsDepartmentsTreeview') systemsDepartmentsTreeview: TreeViewComponent;
  @ViewChild('organizationForm') organizationForm: OrganizationFormComponent;
  @ViewChild('departmentForm') departmentForm: DepartmentFormComponent;
  @ViewChild('permissionAllocation') permissionAllocation: PermissionAllocationComponent;
  @ViewChild('userMultipleList') userMultipleList: WsMultipleListComponent;
  @ViewChild('systemsUsersGrid') systemsUsersGrid: GridComponent;
  @ViewChild('usersUsername') usersUsername: TextBoxComponent;
  @ViewChild('usersEmail') usersEmail: TextBoxComponent;
  @ViewChild('usersPassword') usersPassword: TextBoxComponent;

  /** 当前选中的组织、部门 */
  departmentActiveId = 0;
  departmentActive: ListDataSource;

  /** 部门列表数据 */
  departmentListFields: FieldsSettingsModel;
  /** 部门列表数据 */
  departmentListItems = [];

  //#region 组织表单
  /** 表单操作类别 */
  organizationFormActionType: FormActionType;
  /** 表单数据 */
  organizationFormData: Department;
  //#endregion

  //#region 部门表单
  /** 表单操作类别 */
  departmentFormActionType: FormActionType;
  /** 表单数据 */
  departmentFormData: Department;
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
  userMultipleData: ListData[];

  //#region 其他
  /** 折叠切换按钮 */
  collapseBtn: Button;
  /** 授权目标对象类型 */
  targetType = MandateTargetType.DEPARTMENT;
  /** 授权目标对象id */
  targetId: number;
  //#endregion

  /**
   * 构造函数
   */
  constructor(
    public treeViewProvider: TreeViewProvider,
    public gridProvider: GridProvider,
    public gropDownListProvider: GropDownListProvider,
    public dialogProvider: DialogProvider,
    private _formBuilder: FormBuilder,
    private _organizationsService: OrganizationsService,
    private _departmentsService: DepartmentsService,
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
    this.initDepartmentsData();
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
   * 初始化部门列表数据
   */
  initDepartmentsData(message: string = ''): void {
    // 部门列表数据
    this._departmentsService.getAll({ isSelected: true }).subscribe(departmentListItems => {
      this.departmentListItems = departmentListItems;
      this.departmentListFields = this.treeViewProvider.fields(this.departmentListItems);

      // 消息提示
      if (message !== '') this._wsMessageService.toast('success', message);
    });
  }

  /**
   * 分割折叠展开事件
   */
  splitterToggleClick(): void {
    const nativeElement = this.systemsDepartmentsSplitter['el'].nativeElement;
    const devuiCollapse = select('.devui-collapse', nativeElement);
    devuiCollapse?.click();
  }

  /**
   * 新增组织或部门
   *
   * @param type
   */
  addOperations(type = 'organization'): void {
    switch (type) {
      case 'organization':
        // 新增组织
        this.organizationFormData = null;
        this.organizationFormActionType = 'add';
        this.organizationForm.formDialog.show();
        break;
      case 'department':
        // 新增部门
        if (this.departmentActiveId === 0) {
          const alertDialog = this._wsDialogService.alert('warning', {
            title: `新增失败`,
            content: '请先添加组织，再进行新增部门操作。',
            okButton: {
              click: () => alertDialog.hide(),
            },
          });
        } else {
          this.departmentFormData = null;
          this.departmentFormActionType = 'add';
          this.departmentForm.formDialog.show();
        }
        break;
    }
  }

  /**
   * 树列表搜索
   *
   * @param text
   */
  onSearch(text: string) {
    const predicats = [];
    const _array = [];
    const _filter = [];

    if (text === '') {
      this.systemsDepartmentsTreeview.fields = this.treeViewProvider.fields(this.departmentListItems);
    } else {
      const predicate = new Predicate('name', 'startswith', text, true);
      const filteredList = new DataManager(this.departmentListItems).executeLocal(new Query().where(predicate));

      for (let j = 0; j < filteredList.length; j++) {
        _filter.push(filteredList[j]['id']);
        const filters = this.treeViewProvider.getFilterItems(filteredList[j], this.departmentListItems);
        for (let i = 0; i < filters.length; i++) {
          if (_array.indexOf(filters[i]) === -1 && filters[i] != null) {
            _array.push(filters[i]);
            predicats.push(new Predicate('id', 'equal', filters[i], false));
          }
        }
      }

      if (predicats.length === 0) {
        this.systemsDepartmentsTreeview.fields = this.treeViewProvider.fields([]);
      } else {
        const query = new Query().where(Predicate.or(predicats));
        const newList = new DataManager(this.departmentListItems).executeLocal(query);

        this.systemsDepartmentsTreeview.fields = this.treeViewProvider.fields(newList as ListDataSource[]);

        setTimeout(() => this.systemsDepartmentsTreeview.expandAll(), 100);
      }
    }
  }

  // ----------------------------------------------------------------------------
  // @ 树列表处理
  // ----------------------------------------------------------------------------

  /**
   * 树列表工具栏创建事件
   *
   * @param args
   */
  treeviewToolbarCreated(): void {
    this.collapseBtn = new Button({
      cssClass: `e-tbar-btn e-tbtn-txt e-control e-btn e-lib px-1.5 dark:text-white`,
      iconCss: 'icon icon-collapse-info text-primary',
      isToggle: true,
      content: '折叠',
    });
    this.collapseBtn.appendTo('#collapse_btn');

    this.collapseBtn.element.onclick = (): void => {
      if (this.collapseBtn.element.classList.contains('e-active')) {
        this.collapseBtn.content = '展开';
        this.collapseBtn.iconCss = 'icon icon-expand-info text-primary';

        // 折叠一级节点
        this.systemsDepartmentsTreeview.collapseAll(null, 1);
      } else {
        this.collapseBtn.content = '折叠';
        this.collapseBtn.iconCss = 'icon icon-collapse-info text-primary';

        // 展开一级节点
        this.systemsDepartmentsTreeview.expandAll(null, 1);
      }
    };
  }

  /**
   * 树列表工具栏点击事件
   *
   * @param args
   */
  treeviewToolbarClick(args: ClickEventArgs): void {
    const id = this.departmentActiveId;

    switch (args.item.id) {
      case 'auth':
        this.allocation(id);
        break;
      case 'refresh':
        this.initDepartmentsData('部门刷新成功');
        break;
    }
  }

  /**
   * 树列表数据绑定事件
   *
   * @param args
   */
  treeviewDataBound(args: DataBoundEventArgs): void {
    if (args.data.length === 0) return;

    this.treeViewProvider.dataBound(args, this.systemsDepartmentsTreeview);

    const selectedNodes = this.systemsDepartmentsTreeview.selectedNodes;
    const selectedNodeData = this.systemsDepartmentsTreeview.getNode(selectedNodes[0]);

    this.departmentActive = selectedNodeData;
    this.departmentActiveId = +selectedNodeData.id;

    // 更新用户列表
    this.initSystemsUsersData();
  }

  /**
   * 树列表节点折叠事件
   *
   * @param args
   */
  treeviewNodeCollapsed(args: NodeExpandEventArgs): void {
    this.departmentListItems = this.departmentListItems.map(item => {
      return item.id === +args.nodeData.id ? { ...item, expanded: false } : item;
    });
  }

  /**
   * 树列表节点展开事件
   *
   * @param args
   */
  treeviewNodeExpanded(args: NodeExpandEventArgs): void {
    this.treeViewProvider.nodeExpanded(args, this.systemsDepartmentsTreeview);

    this.departmentListItems = this.departmentListItems.map(item => {
      return item.id === +args.nodeData.id ? { ...item, expanded: true } : item;
    });
  }

  /**
   * 树列表节点选中事件
   *
   * @param args
   */
  treeviewNodeSelected(args: NodeSelectEventArgs): void {
    const nodeData = args.nodeData;

    this.departmentActive = nodeData;
    this.departmentActiveId = +nodeData.id;

    // 更新用户列表
    this.initSystemsUsersData();
  }

  /**
   * 树列表操作
   *
   * @param type
   */
  treeviewOperations(nodeData: Department, type = 'childOrganization'): void {
    const id = nodeData.id;
    const name = nodeData.name;
    const isFirst = nodeData.level === 1;
    const membersCount = nodeData.membersCount;
    const hasChildren = nodeData?.hasChildren;

    switch (type) {
      case 'manage':
        this._wsMessageService.toast('info', '设置负责人');
        break;
      case 'childOrganization':
        // 新增子部门
        this.departmentFormData = null;
        this.departmentFormActionType = 'add';
        this.departmentForm.formDialog.show();
        break;
      case 'edit':
        if (isFirst) {
          this.organizationFormData = nodeData;
          this.organizationFormActionType = 'edit';
          this.organizationForm.formDialog.show();
        } else {
          this.departmentFormData = nodeData;
          this.departmentFormActionType = 'edit';
          this.departmentForm.formDialog.show();
        }
        break;
      case 'auth':
        this.allocation(id);
        break;
      case 'delete':
        const actionName = isFirst ? '组织' : '部门';

        if (membersCount > 0) {
          const alertDialog = this._wsDialogService.alert('warning', {
            title: `删除『${name}』失败`,
            content: `请先移除组织内所有成员，再进行删除${actionName}操作。`,
            okButton: {
              click: () => alertDialog.hide(),
            },
          });
        } else if (hasChildren) {
          const alertDialog = this._wsDialogService.alert('warning', {
            title: `删除『${name}』失败`,
            content: `请先删除所有子部门，再进行删除${actionName}操作。`,
            okButton: {
              click: () => alertDialog.hide(),
            },
          });
        } else {
          const confirmDialog = this._wsDialogService.confirm('error', {
            title: `确定删除『${name}』${actionName}吗？`,
            content: '删除后将无法恢复，请谨慎操作！',
            okButton: {
              click: () => {
                if (isFirst) {
                  this._organizationsService
                    .remove({ id })
                    .pipe(finalize(() => confirmDialog.hide()))
                    .subscribe({
                      next: data => {
                        const firstParent: Department = find(this.departmentListItems, {
                          level: 1,
                          parentId: null,
                        });
                        this.departmentListItems = this.departmentListItems.map(item => {
                          if (item.id === firstParent.id) {
                            item['selected'] = true;
                            return item;
                          } else {
                            if (item.selected) item.selected = false;
                            return item;
                          }
                        });
                        remove(this.departmentListItems, ['id', id]);
                        this.systemsDepartmentsTreeview.removeNodes([id.toString()]);
                      },
                    });
                } else {
                  this._departmentsService
                    .remove({ id })
                    .pipe(finalize(() => confirmDialog.hide()))
                    .subscribe({
                      next: data => {
                        // 删除部门，更新信息并默认选中上级部门
                        this.departmentListItems = this.departmentListItems.map(item => {
                          if (item.id === data.parentId) {
                            item['selected'] = true;
                            item['expanded'] = data.siblingCount !== 0;
                            item['hasChildren'] = data.siblingCount !== 0;
                            return item;
                          } else {
                            if (item.selected) item.selected = false;
                            return item;
                          }
                        });
                        remove(this.departmentListItems, ['id', id]);
                        this.systemsDepartmentsTreeview.removeNodes([id.toString()]);
                      },
                    });
                }
              },
            },
          });
        }
        break;
    }
  }

  // ----------------------------------------------------------------------------
  // @ 组织表单
  // ----------------------------------------------------------------------------

  /**
   * 组织表单操作成功事件
   *
   * @param args
   */
  organizationFormActionSuccess(args: FormActionArgs): void {
    const data = <ListDataSource>args.data;

    switch (args.actionType) {
      case 'add':
        this.departmentListItems.push(data);
        // 新增第一个组织，默认选中
        if (this.departmentListItems.length === 1) {
          this.departmentListItems = this.departmentListItems.map(item => {
            item.selected = true;
            return item;
          });
        }

        this.systemsDepartmentsTreeview.addNodes([data]);
        break;
      case 'edit':
        // 修改组织，默认选中
        this.departmentListItems = this.departmentListItems.map(item => {
          if (item.id === data.id) {
            return { ...item, ...data, selected: true };
          } else {
            if (item.selected) item.selected = false;
            return item;
          }
        });

        this.departmentListFields = this.treeViewProvider.fields(this.departmentListItems);
        break;
    }
  }

  // ----------------------------------------------------------------------------
  // @ 部门表单
  // ----------------------------------------------------------------------------

  /**
   * 部门表单操作成功事件
   *
   * @param args
   */
  departmentFormActionSuccess(args: FormActionArgs): void {
    const data = <ListDataSource>args.data;

    switch (args.actionType) {
      case 'add':
        this.departmentListItems.push(data);
        // 新增部门，更新上级部门信息，默认选中当前部门
        this.departmentListItems = this.departmentListItems.map(item => {
          // 更新上级部门信息
          if (item.id === data.parentId) {
            item['selected'] = false;
            item['expanded'] = true;
            item['hasChildren'] = true;
            return item;
            // 默认选中当前部门
          } else if (item.id === data.id) {
            item['selected'] = true;
            return item;
          } else {
            if (item.selected) item.selected = false;
            return item;
          }
        });

        this.systemsDepartmentsTreeview.addNodes([data]);
        break;
      case 'edit':
        // 修改部门，更新修改前后的上级部门信息，默认选中当前部门
        const beforeEditData = find(this.departmentListItems, ['id', data.id]);
        const beforeParentId = beforeEditData.parentId;
        const afterParentId = data.parentId;

        this.departmentListItems = this.departmentListItems.map(item => {
          // 修改前的上级节点更新
          if (item.id === beforeParentId && beforeParentId !== afterParentId) {
            if (+data.siblingCount === 1) {
              item['expanded'] = false;
              item['hasChildren'] = false;
            }
            return item;
            // 修改后的上级节点更新
          } else if (item.id === afterParentId && beforeParentId !== afterParentId) {
            item['expanded'] = true;
            item['hasChildren'] = true;
            return item;
            // 默认选中当前部门
          } else if (item.id === data.id) {
            return { ...item, ...data, selected: true };
          } else {
            if (item.selected) item.selected = false;
            return item;
          }
        });

        this.departmentListFields = this.treeViewProvider.fields(this.departmentListItems);
        break;
    }
  }

  // ----------------------------------------------------------------------------
  // @ 选择成员
  // ----------------------------------------------------------------------------

  // 加载选择成员数据
  loadUserMultipleData(): void {
    this._usersService.getData().subscribe(data => {
      const filterList = filter(data.result, user => !user.departmentIds?.includes(this.departmentActiveId.toString()));

      this.userMultipleData = filterList.map(user => {
        const id = user.id;
        const name = user.username;
        const departmentNames = user.departmentIds?.map(departmentId => {
          return this.departmentListItems.find(item => item.id === +departmentId)?.name;
        });
        const description = departmentNames?.join('、');
        return { id, name, description };
      }) as ListData[];
    });
  }

  /**
   * 选择成员确认事件
   *
   * @param userIds
   */
  userMultipleConfirm(userIds: number[]): void {
    const departmentId = this.departmentActiveId;

    // 批量成员设置部门
    this._usersService.batchSetDepartment({ userIds, departmentId }).subscribe({
      next: () => {
        this._wsMessageService.toast('success', '添加成员成功');
        this.initSystemsUsersData();

        // 更新部门人数
        this._membersCountHandle();
      },
    });
  }

  // ----------------------------------------------------------------------------
  // @ 用户表格
  // ----------------------------------------------------------------------------

  // 初始化数据
  initSystemsUsersData(message: string = ''): void {
    // 获取表格数据
    const state: DataStateChangeEventArgs = {
      where: [new Predicate('department_ids_findinset', 'equal', this.departmentActiveId)],
    };

    this._usersService.getData(state).subscribe({
      next: result => {
        this.systemsUsersData = result.dataManager;

        if (message !== '') this._wsMessageService.toast('success', message);
      },
      error: error => {
        this._wsMessageService.error(error);
      },
    });
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
        if (this.departmentActiveId === 0) {
          const alertDialog = this._wsDialogService.alert('warning', {
            title: `添加失败`,
            content: '请先添加组织、部门，再进行添加成员操作。',
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
          const departmentId = this.departmentActiveId;
          const departmentName = this.departmentActive.text;

          const confirmDialog = this._wsDialogService.confirm('warning', {
            title: `确定从『${departmentName}』部门移除？`,
            content: '撤销部门将会使该用户失去此部门的所有权限',
            okButton: {
              click: () => {
                // 移除成员
                this._usersService
                  .removeDepartment({ userIds, departmentId })
                  .pipe(finalize(() => confirmDialog.hide()))
                  .subscribe(() => {
                    this.initSystemsUsersData();

                    // 更新部门人数
                    this._membersCountHandle();
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
  // @ 授权
  // ----------------------------------------------------------------------------

  /**
   * 分配
   *
   * @param id
   * @param type
   */
  allocation(id: number, type = MandateTargetType.DEPARTMENT): void {
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

  /**
   * 更新部门人数
   *
   * @returns
   */
  private _membersCountHandle(): void {
    setTimeout(() => {
      this.departmentListItems = this.departmentListItems.map(item => {
        if (item.id === this.departmentActiveId) {
          const membersCount = this.systemsUsersGrid.getRowsObject().length;
          item['membersCount'] = membersCount;
          item['selected'] = true;
        } else {
          if (item.selected) item.selected = false;
        }

        return item;
      });
    }, 100);
  }
}
