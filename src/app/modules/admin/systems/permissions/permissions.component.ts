import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { Button } from '@syncfusion/ej2-angular-buttons';
import {
  Column,
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
  NodeExpandEventArgs,
  NodeSelectEventArgs,
  ToolbarAllModule,
  TreeViewAllModule,
  TreeViewComponent,
} from '@syncfusion/ej2-angular-navigations';
import { select } from '@syncfusion/ej2-base';
import { DataManager, Predicate } from '@syncfusion/ej2-data';
import { wsAnimations } from '@ws/animations';
import { OnReuseInit, ReuseHookOnReuseInitType } from '@ws/components/reuse-tab';
import { WsToggleComponent } from '@ws/components/toggle';
import { WsScrollbarDirective } from '@ws/directives/scrollbar';
import { ListDataSource } from '@ws/interfaces';
import { DialogProvider, GridProvider, GropDownListProvider, TreeViewProvider } from '@ws/providers';
import { WsMessageService } from '@ws/services/message';
import { WsDialogService, WsUtilsService } from '@ws/services/utils';
import { PermissionTypeItems } from 'app/core/constants';
import { MenusService } from 'app/core/systems/menus';
import { IColumnPermissionModel, PermissionsService } from 'app/core/systems/permissions';
import { WsHeaderComponent } from 'app/layout/common/header';
import { filter, find } from 'lodash-es';
import { SearchModule, SplitterComponent, SplitterModule, TabsModule } from 'ng-devui';
import { finalize } from 'rxjs';

@Component({
  selector: 'systems-permissions',
  templateUrl: './permissions.component.html',
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
    MatDividerModule,
    SearchModule,
    TreeViewAllModule,
    WsScrollbarDirective,
    GridAllModule,
    WsToggleComponent,
    TabsModule,
    TextBoxAllModule,
    MatRadioModule,
  ],
})
export class SystemsPermissionsComponent implements OnReuseInit, OnInit, AfterViewInit {
  @ViewChild('systemsPermissionsSplitter') systemsPermissionsSplitter: SplitterComponent;
  @ViewChild('systemsPermissionsTreeview') systemsPermissionsTreeview: TreeViewComponent;
  @ViewChild('systemsPermissionsGrid') systemsPermissionsGrid: GridComponent;
  @ViewChild('permissionsCode') permissionsCode: TextBoxComponent;
  @ViewChild('permissionsName') permissionsName: TextBoxComponent;

  /** 当前选中的菜单 */
  menuActiveId = 0;
  menuActive: ListDataSource;

  /** 菜单列表数据 */
  menuListFields: FieldsSettingsModel;
  /** 菜单列表数据 */
  menuListItems = [];

  /** 权限弹窗名称 */
  systemsPermissionsDialogName = '权限';
  /** 权限表格id */
  systemsPermissionsGridId = 'systems_permissions_grid';
  /** 权限表格数据 */
  systemsPermissionsData: DataManager;
  /** 权限表单 */
  systemsPermissionsForm: FormGroup;

  //#region 权限表单
  /** 权限分类id */
  permissionTypeActiveId: string | number = 'ACTION';
  /** 权限分类数据 */
  permissionTypeItems = PermissionTypeItems;
  //#endregion

  //#region 其他
  /** 权限实体 */
  permissionEntity = 'permission';
  /** 权限实体id */
  permissionId: string;
  /** 修改之前数据 */
  beforeEditData = null;
  /** 折叠切换按钮 */
  collapseBtn: Button;
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
    private _menusService: MenusService,
    private _permissionsService: PermissionsService,
    private _wsMessageService: WsMessageService,
    private _wsUtilsService: WsUtilsService,
    private _wsDialogService: WsDialogService,
  ) {}

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 路由复用进入
   */
  _onReuseInit(type: ReuseHookOnReuseInitType) {
    switch (type) {
      case 'init':
        this.gridProvider.toolbarHandle(this.systemsPermissionsGrid, 'text');
        this.gridProvider.toolbarHandle(this.systemsPermissionsGrid, 'isEnable');
        this.systemsPermissionsGrid.refresh();
        break;
    }
  }

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    this.initMenusData();
  }

  /**
   * 视图初始化后
   */
  ngAfterViewInit(): void {
    // 表格默认设置
    this.gridProvider.defaultHandle(this.systemsPermissionsGrid);

    // 开启拖动
    this.systemsPermissionsGrid.allowRowDragAndDrop = true;
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 初始化菜单列表数据
   */
  initMenusData(message: string = ''): void {
    // 菜单列表数据
    this._menusService.getAll({ isSelected: true }).subscribe(menuListItems => {
      this.menuListItems = filter(menuListItems, menuListItem => menuListItem.type !== 'divider');
      this.menuListFields = this.treeViewProvider.fields(this.menuListItems, { text: 'title' });

      // 消息提示
      if (message !== '') this._wsMessageService.toast('success', message);
    });
  }

  /**
   * 分割折叠展开事件
   */
  splitterToggleClick(): void {
    const nativeElement = this.systemsPermissionsSplitter['el'].nativeElement;
    const devuiCollapse = select('.devui-collapse', nativeElement);
    devuiCollapse?.click();
  }

  // ----------------------------------------------------------------------------
  // @ 树列表处理
  // ----------------------------------------------------------------------------

  /**
   * 树列表搜索
   *
   * @param text
   */
  onSearch(text: string) {}

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
        this.systemsPermissionsTreeview.collapseAll(null, 1);
      } else {
        this.collapseBtn.content = '折叠';
        this.collapseBtn.iconCss = 'icon icon-collapse-info text-primary';

        // 展开一级节点
        this.systemsPermissionsTreeview.expandAll(null, 1);
      }
    };
  }

  /**
   * 树列表工具栏点击事件
   *
   * @param args
   */
  treeviewToolbarClick(args: ClickEventArgs): void {
    switch (args.item.id) {
      case 'refresh':
        this.initMenusData('菜单刷新成功');
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

    const selectedNodes = this.systemsPermissionsTreeview.selectedNodes;
    const selectedNodeData = this.systemsPermissionsTreeview.getNode(selectedNodes[0]);

    this.menuActive = selectedNodeData;
    this.menuActiveId = +selectedNodeData.id;

    // 更新权限列表
    this.initSystemsPermissionsData();
  }

  /**
   * 树列表节点折叠事件
   *
   * @param args
   */
  treeviewNodeCollapsed(args: NodeExpandEventArgs): void {
    this.menuListItems = this.menuListItems.map(item => {
      return item.id === +args.nodeData.id ? { ...item, expanded: false } : item;
    });
  }

  /**
   * 树列表节点展开事件
   *
   * @param args
   */
  treeviewNodeExpanded(args: NodeExpandEventArgs): void {
    this.menuListItems = this.menuListItems.map(item => {
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

    this.menuActive = nodeData;
    this.menuActiveId = +nodeData.id;

    // 更新权限列表
    this.initSystemsPermissionsData();
  }

  // ----------------------------------------------------------------------------
  // @ 权限表格
  // ----------------------------------------------------------------------------

  /**
   * 初始化数据
   *
   * @param message
   */
  initSystemsPermissionsData(message: string = ''): void {
    // 获取表格数据
    const state: DataStateChangeEventArgs = {
      where: [new Predicate('menuId', 'equal', this.menuActiveId)],
    };

    this._permissionsService.getData(state).subscribe({
      next: result => {
        this.systemsPermissionsData = result.dataManager;

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
  systemsPermissionsActionBegin(args: SaveEventArgs): void {
    if (['add', 'beginEdit'].includes(args.requestType)) {
      // 新增之前
      if (args.requestType === 'add') {
        args.rowData['type'] = this.permissionTypeActiveId;
      }
      // 修改之前
      else {
        this.beforeEditData = args.rowData;
        this.permissionTypeActiveId = args.rowData['type'];
      }
      this.createFormGroup(args.rowData);
    }

    if (args.requestType === 'save') {
      if (this._systemsPermissionsFormVerify()) {
        let data = {};
        if (args.action === 'add') {
          const rowsCount = this.systemsPermissionsGrid.getRowsObject().length;
          data = { sort: rowsCount + 1, ...this.systemsPermissionsForm.value };
        } else {
          data = this.systemsPermissionsForm.value;
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
  systemsPermissionsActionComplete(args: DialogEditEventArgs | SaveEventArgs): void {
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
          ? `新增${this.systemsPermissionsDialogName}`
          : `修改「${args.rowData['name']}」${this.systemsPermissionsDialogName}`;

      dialog && this.gridProvider.dialogHandle(dialog, header);
    }

    switch (args.requestType) {
      case 'columnstate':
        // 自动调整所有列
        this.systemsPermissionsGrid.autoFitColumns();
        break;
    }

    if (['save', 'delete', 'cancel'].includes(args.requestType)) {
      this.initSystemsPermissionsData();

      if (args.requestType !== 'delete') {
        // 表单字段重置
        this.permissionTypeActiveId = 'ACTION';
        this._resetFormField();
      }
    }
  }

  /**
   * 工具栏点击事件
   *
   * @param args
   */
  systemsPermissionsToolbarClick(args: ClickEventArgs): void {
    this.gridProvider.defaultToolbarClick(args, this.systemsPermissionsGridId, this.systemsPermissionsGrid);

    const records: IColumnPermissionModel[] = this.systemsPermissionsGrid.getSelectedRecords();

    switch (args.item.id) {
      case 'enable':
        if (records.length > 0) {
          const ids = records.map(record => record.id);
          // 启用数据
          this._permissionsService
            .enableOrDisable({ ids, status: true })
            .subscribe(() => this.initSystemsPermissionsData());
        } else {
          this._wsDialogService.gridAlert('没有为启用操作选择记录', this.systemsPermissionsGrid.element);
        }
        break;
      case 'disable':
        if (records.length > 0) {
          const ids = records.map(record => record.id);
          // 禁用数据
          this._permissionsService
            .enableOrDisable({ ids, status: false })
            .subscribe(() => this.initSystemsPermissionsData());
        } else {
          this._wsDialogService.gridAlert('没有为禁用操作选择记录', this.systemsPermissionsGrid.element);
        }
        break;
      case 'refresh':
        this.initSystemsPermissionsData('权限刷新成功');

        // 清除过滤
        this.systemsPermissionsGrid.clearFiltering();
        // 清除排序
        this.systemsPermissionsGrid.clearSorting();
        break;
    }
  }

  /**
   * 拖动到目标事件
   *
   * @param args
   */
  systemsPermissionsRowDrop(args: RowDragEventArgs): void {
    args.cancel = true;

    const value = [];
    for (let r = 0; r < args.rows.length; r++) {
      value.push(args.fromIndex + r);
    }

    // 当拖动位置发生变化时
    if (value[0] !== args.dropIndex) {
      this.systemsPermissionsGrid.reorderRows(value, args.dropIndex);

      setTimeout(() => {
        const currentRows = this.systemsPermissionsGrid.getCurrentViewRecords();
        const ids = currentRows.map(currentRow => currentRow['id']);

        // 调整权限排序
        this._permissionsService.sort({ ids, type: this.menuActiveId, typeName: 'menu_id' }).subscribe();
      });
    }
  }

  /**
   * 自定义单元格值处理
   *
   * @param field
   * @param data
   */
  valueAccessor(field: string, data: object, column: Column): object | string {
    data = data['data'] || data;
    const value = data[field];

    switch (column.field) {
      case 'type':
        const typeData = find(this.permissionTypeItems, { id: value });
        return typeData['title'];
    }
  }

  /**
   * 筛选列表处理
   */
  filterItemsHandle({ column, ...args }): string {
    switch (column.field) {
      case 'type':
        return find(this.permissionTypeItems, { id: args.type })['title'];
      case 'status':
        return this.gridProvider.statusHandle(column.field, args);
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
  createFormGroup(data: IColumnPermissionModel): void {
    this.systemsPermissionsForm = this._formBuilder.group({
      id: [data.id],
      menuId: [this.menuActiveId],
      type: [data.type, Validators.required],
      code: [data.code, Validators.required],
      name: [data.name, Validators.required],
      description: [data.description],
      status: [data.status ?? true],
    });

    // 权限实体id赋值
    this.permissionId = data.id;
  }

  /**
   * 权限分类切换事件
   *
   * @param type
   */
  permissionTypeActiveTabChange(type: string | number): void {
    if (this.systemsPermissionsForm) {
      this.systemsPermissionsForm.patchValue({ type });
      if (this.beforeEditData && this.beforeEditData.type !== type) {
        this.systemsPermissionsForm.get('type').markAsDirty();
      }

      // 表单字段重置
      this._resetFormField();
    }
  }

  /**
   * 状态改变事件
   *
   * @param status
   * @param data
   */
  wsToggleChange(status: boolean, data: IColumnPermissionModel): void {
    // 启用/禁用数据
    this._permissionsService
      .enableOrDisable({ ids: [data.id], status })
      .pipe(finalize(() => setTimeout(() => this.initSystemsPermissionsData(), 300)))
      .subscribe();
  }

  // ----------------------------------------------------------------------------
  // @ 私有方法
  // ----------------------------------------------------------------------------

  /**
   * 权限表单验证
   *
   * @returns
   */
  private _systemsPermissionsFormVerify(): boolean {
    // 数据验证
    if (this.systemsPermissionsForm.invalid) {
      const nameControl = this.systemsPermissionsForm.get('name');
      const codeControl = this.systemsPermissionsForm.get('code');

      if (nameControl.hasError('required')) {
        this.permissionsName.focusIn();
        this._wsMessageService.toast('warning', '请输入名称');
      } else if (codeControl.hasError('required')) {
        this.permissionsCode.focusIn();
        this._wsMessageService.toast('warning', '请输入编号');
      }

      return false;
    }

    // 数据是否修改过
    if (!this.systemsPermissionsForm.dirty) {
      this._wsMessageService.toast('warning', '暂无提交修改的数据');
      return false;
    }

    return true;
  }

  /**
   * 表单字段重置
   */
  private _resetFormField(): void {
    this.beforeEditData = null;
    this.systemsPermissionsForm.patchValue({
      type: this.permissionTypeActiveId,
    });
  }
}
