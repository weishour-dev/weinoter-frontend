import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  DdtDataBoundEventArgs,
  DropDownListAllModule,
  DropDownListComponent,
  DropDownTreeAllModule,
  DropDownTreeComponent,
  FilteringEventArgs,
} from '@syncfusion/ej2-angular-dropdowns';
import {
  Column,
  DataStateChangeEventArgs,
  DialogEditEventArgs,
  RowDragEventArgs,
  SaveEventArgs,
} from '@syncfusion/ej2-angular-grids';
import { TextBoxAllModule, TextBoxComponent } from '@syncfusion/ej2-angular-inputs';
import { ClickEventArgs } from '@syncfusion/ej2-angular-navigations';
import { TreeGridAllModule, TreeGridComponent } from '@syncfusion/ej2-angular-treegrid';
import { DataManager } from '@syncfusion/ej2-data';
import { wsAnimations } from '@ws/animations';
import { WsNavigationItem } from '@ws/components/navigation';
import { OnReuseInit, ReuseHookOnReuseInitType } from '@ws/components/reuse-tab';
import { WsToggleComponent } from '@ws/components/toggle';
import { GropDownListProvider, GropDownTreeProvider, TreeGridProvider } from '@ws/providers';
import { WsMessageService } from '@ws/services/message';
import { GridService, WsDialogService, WsUtilsService } from '@ws/services/utils';
import { IconsService } from 'app/core/icons';
import { NavigationService } from 'app/core/navigation';
import { IColumnMenuModel, MenuModel, MenusService } from 'app/core/systems/menus';
import { WsHeaderComponent } from 'app/layout/common/header';
import { find, isUndefined } from 'lodash-es';
import { TabsModule } from 'ng-devui';
import { finalize } from 'rxjs';
import { MenuTypeItems } from './menus.columns';

@UntilDestroy()
@Component({
  selector: 'systems-menus',
  templateUrl: './menus.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: wsAnimations,
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    WsHeaderComponent,
    TreeGridAllModule,
    MatIconModule,
    WsToggleComponent,
    TabsModule,
    MatDividerModule,
    DropDownTreeAllModule,
    DropDownListAllModule,
    TextBoxAllModule,
    MatRadioModule,
  ],
})
export class SystemsMenusComponent implements OnReuseInit, OnInit, AfterViewInit {
  @ViewChild('systemsMenusGrid') systemsMenusGrid: TreeGridComponent;
  @ViewChild('parentMenu') parentMenu: DropDownTreeComponent;
  @ViewChild('menusIcon') menusIcon: DropDownListComponent;
  @ViewChild('menusTitle') menusTitle: TextBoxComponent;
  @ViewChild('menusLink') menusLink: TextBoxComponent;

  /** 菜单弹窗名称 */
  systemsMenusDialogName = '菜单';
  /** 菜单表格id */
  systemsMenusGridId = 'systems_menus_grid';
  /** 菜单表格数据 */
  systemsMenusData: DataManager;
  /** 菜单分类id */
  menuTypeActiveId: string | number = 'basic';
  /** 菜单分类数据 */
  menuTypeItems = MenuTypeItems;
  /** 菜单表单 */
  systemsMenusForm: FormGroup;
  /** 图标数据 */
  iconDatas: { name: string; id: string }[];
  /** 上级菜单id */
  parentMenuId: string[] = [];
  /** 上级菜单数据 */
  parentMenus: MenuModel[];
  /** 上级菜单是否隐藏 */
  parentMenuHidden = false;
  /** 上级菜单是否必填 */
  parentMenuRequired = false;
  /** 路由地址是否隐藏 */
  linkHidden = false;
  /** 修改之前数据 */
  beforeEditData = null;

  /**
   * 构造函数
   */
  constructor(
    public treeGridProvider: TreeGridProvider,
    public gropDownListProvider: GropDownListProvider,
    public gropDownTreeProvider: GropDownTreeProvider,
    private _formBuilder: FormBuilder,
    private _menusService: MenusService,
    private _navigationService: NavigationService,
    private _iconsService: IconsService,
    private _wsMessageService: WsMessageService,
    private _gridService: GridService,
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
        this.treeGridProvider.toolbarHandle(this.systemsMenusGrid, 'text');
        this.treeGridProvider.toolbarHandle(this.systemsMenusGrid, 'isEnable');
        this.systemsMenusGrid.refresh();
        break;
    }
  }

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    // 上级菜单数据上级菜单数据
    this.initParentMenusData();

    // 图标列表数据
    this._iconsService.icons.pipe(untilDestroyed(this)).subscribe(icons => {
      this.iconDatas = icons.list.map((name: string) => ({
        name,
        id: `${icons.namespace}:${name}`,
      }));
    });

    // 加载表格数据
    this.initSystemsMenusData();
  }

  /**
   * 视图初始化后
   */
  ngAfterViewInit(): void {
    // 表格默认设置
    this.treeGridProvider.defaultHandle(this.systemsMenusGrid);

    // 开启拖动
    this.systemsMenusGrid.allowRowDragAndDrop = true;
  }

  /**
   * 初始化上级菜单数据
   */
  initParentMenusData(): void {
    // 上级菜单列表数据
    this._menusService.parent().subscribe(parentMenus => {
      this.parentMenus = parentMenus.map(parentMenu => {
        parentMenu['name'] = parentMenu.title;
        return parentMenu;
      });
    });
  }

  // ----------------------------------------------------------------------------
  // @ 菜单表格
  // ----------------------------------------------------------------------------

  // 初始化数据
  initSystemsMenusData(message: string = ''): void {
    // 获取表格数据
    const state: DataStateChangeEventArgs = {};

    this._menusService.getData(state).subscribe({
      next: result => {
        this.systemsMenusData = result.dataManager;

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
  systemsMenusActionBegin(args: SaveEventArgs): void {
    // console.log('ActionBegin:', args);
    if (['add', 'beginEdit'].includes(args.requestType)) {
      // 新增之前
      if (args.requestType === 'add') {
        const parentId = isUndefined(this.parentMenuId[0]) ? null : +this.parentMenuId[0];

        args.rowData['type'] = this.menuTypeActiveId;
        args.rowData['parentId'] = parentId;
      }
      // 修改之前
      else {
        this.beforeEditData = args.rowData;
        this.menuTypeActiveId = args.rowData['type'];
        this.parentMenuId = [args.rowData['parentId']?.toString() || ''];
      }

      // 上级菜单数据上级菜单数据
      this.initParentMenusData();
      this.createFormGroup(args.rowData);
    }

    // 删除前处理
    args.cancel = this._gridService.deleteBeginHandle(args);

    if (args.requestType === 'save') {
      if (this._systemsMenusFormVerify()) {
        let data = {};
        if (args.action === 'add') {
          const rowsCount = this.systemsMenusGrid.getDataRows().length;
          data = { sort: rowsCount + 1, ...this.systemsMenusForm.value };
        } else {
          data = this.systemsMenusForm.value;
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
  systemsMenusActionComplete(args: DialogEditEventArgs | SaveEventArgs): void {
    // console.log('ActionComplete:', args);
    const isComplete = args.type === 'actionComplete';
    let navigationItem: WsNavigationItem;

    if (this._wsUtilsService.isProps<SaveEventArgs>(args, 'action')) {
      // 新增完成
      if (args.action === 'add' && isComplete) {
        const status = args?.promise['__zone_symbol__state'];
        const result = args?.promise['__zone_symbol__value'];

        if (status) {
          navigationItem = result.data;
          // 导航菜单新增
          this._navigationService.actionHandle('add', navigationItem);
        }
      }
      // 修改完成
      else if (args.action === 'edit' && isComplete) {
        const editData = args.data;

        navigationItem = {
          id: editData['id'],
          type: editData['type'],
          icon: editData['icon'],
          title: editData['title'],
          translation: editData['translation'],
          link: editData['link'],
          subtitle: editData['subtitle'],
          badge: {
            title: editData['badgeTitle'],
          },
          reuse: editData['reuse'],
          reuseCloseable: editData['reuseCloseable'],
          isHidden: editData['hidden'],
          hidden: editData['hidden'],
          disabled: editData['disabled'],
        };

        // 导航菜单修改
        this._navigationService.actionHandle('edit', navigationItem);
      }
    } else if (this._wsUtilsService.isProps<DialogEditEventArgs>(args, 'dialog')) {
      const dialog = args.dialog;
      const header =
        args.requestType === 'add'
          ? `新增${this.systemsMenusDialogName}`
          : `修改「${args.rowData['title']}」${this.systemsMenusDialogName}`;

      dialog && this.treeGridProvider.dialogHandle(dialog, header);
    }

    switch (args.requestType) {
      case 'delete':
        if (isComplete) {
          const deleteData = args['data'];

          for (const data of deleteData) {
            // 导航菜单删除
            this._navigationService.actionHandle('remove', { id: data['id'], type: data['type'] });
          }
        }
        break;
      case 'columnstate':
        // 自动调整所有列
        this.systemsMenusGrid.autoFitColumns();
        break;
    }

    // 更新表格数据
    if (['save', 'delete', 'cancel'].includes(args.requestType)) {
      this.initSystemsMenusData();

      if (args.requestType !== 'delete') {
        // 表单字段重置
        this.menuTypeActiveId = 'basic';
        this._resetFormField();
      }
    }
  }

  /**
   * 工具栏点击事件
   *
   * @param args
   */
  systemsMenusToolbarClick(args: ClickEventArgs): void {
    this.treeGridProvider.defaultToolbarClick(args, this.systemsMenusGridId, this.systemsMenusGrid);

    const records: IColumnMenuModel[] = this.systemsMenusGrid.getSelectedRecords();

    switch (args.item.id) {
      case 'enable':
        if (records.length > 0) {
          const ids = records.map(record => record.id);
          // 启用数据
          this._menusService.enableOrDisable({ ids, status: true }).subscribe(() => {
            this.initSystemsMenusData();
            for (const record of records) {
              record.disabled = false;
              this.navigationEditHandle(record);
            }
          });
        } else {
          this._wsDialogService.gridAlert('没有为启用操作选择记录', this.systemsMenusGrid.element);
        }
        break;
      case 'disable':
        if (records.length > 0) {
          const ids = records.map(record => record.id);
          // 禁用数据
          this._menusService.enableOrDisable({ ids, status: false }).subscribe(() => {
            this.initSystemsMenusData();
            for (const record of records) {
              record.disabled = true;
              this.navigationEditHandle(record);
            }
          });
        } else {
          this._wsDialogService.gridAlert('没有为禁用操作选择记录', this.systemsMenusGrid.element);
        }
        break;
      case 'refresh':
        this.initSystemsMenusData('刷新成功');
        break;
    }
  }

  /**
   * 拖动到目标事件
   *
   * @param args
   */
  systemsMenusRowDrop(args: RowDragEventArgs): void {
    args.cancel = true;

    const value = [];
    for (let r = 0; r < args.rows.length; r++) {
      value.push(args.fromIndex + r);
    }

    console.log(args);
    // 当拖动位置发生变化时
    if (value[0] !== args.dropIndex) {
      this.systemsMenusGrid.reorderRows(value, args.dropIndex, 'below');

      const dropElement = this.systemsMenusGrid.getRowByIndex(args.dropIndex);
      const dropRowInfo = this.systemsMenusGrid.getRowInfo(dropElement);
      console.log(dropRowInfo);
      console.log(value, args.dropIndex);
      setTimeout(() => {
        const currentRows = this.systemsMenusGrid.getCurrentViewRecords();
        const ids = currentRows.map(currentRow => currentRow['id']);

        // 调整分类菜单排序
        // this._menusService.sort({ids}).subscribe({
        //   next: () => this._navigationService.get().subscribe(),
        // });
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
        const typeData = find(this.menuTypeItems, { id: value });
        return typeData['title'];
    }
  }

  /**
   * 筛选列表处理
   */
  filterItemsHandle({ column, ...args }): string {
    switch (column.field) {
      case 'type':
        return find(this.menuTypeItems, { id: args.type })['title'];
      case 'disabled':
      case 'hidden':
      case 'isSystem':
        return this.treeGridProvider.statusHandle(column.field, args);
    }
  }

  /**
   * 导航修改更新
   */
  navigationEditHandle(data: object): void {
    const navigationItem: WsNavigationItem = {
      id: data['id'],
      type: data['type'],
      icon: data['icon'],
      title: data['title'],
      translation: data['translation'],
      link: data['link'],
      subtitle: data['subtitle'],
      badge: {
        title: data['badgeTitle'],
      },
      reuse: data['reuse'],
      reuseCloseable: data['reuseCloseable'],
      isHidden: data['hidden'],
      hidden: item => item.isHidden,
      disabled: data['disabled'],
    };

    // 导航菜单修改
    this._navigationService.actionHandle('edit', navigationItem);
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
  createFormGroup(data: IColumnMenuModel): void {
    this.systemsMenusForm = this._formBuilder.group({
      id: [data.id],
      parentId: [data.parentId],
      type: [data.type, [Validators.required]],
      icon: [data.icon, [Validators.required]],
      title: [data.title, Validators.required],
      translation: [data.translation || ''],
      link: [data.link || '', Validators.required],
      subtitle: [data.subtitle || ''],
      badgeTitle: [data.badgeTitle || ''],
      reuse: [data.reuse ?? true],
      reuseCloseable: [data.reuseCloseable ?? true],
      hidden: [data.hidden ?? false],
      disabled: [data.disabled ?? false],
    });

    this._systemsMenusFormHidden(data.type);
  }

  /**
   * 隐藏改变事件
   *
   * @param hidden
   * @param data
   */
  wsHiddenChange(hidden: boolean, data: IColumnMenuModel): void {
    data.hidden = !hidden;

    // 显示/隐藏数据
    this._menusService
      .showOrHidden([data.id], hidden)
      .pipe(finalize(() => setTimeout(() => this.initSystemsMenusData(), 300)))
      .subscribe(() => this.navigationEditHandle(data));
  }

  /**
   * 状态改变事件
   *
   * @param disabled
   * @param data
   */
  wsToggleChange(disabled: boolean, data: IColumnMenuModel): void {
    data.disabled = !disabled;

    // 启用/禁用数据
    this._menusService
      .enableOrDisable({ ids: [data.id], status: disabled })
      .pipe(finalize(() => setTimeout(() => this.initSystemsMenusData(), 300)))
      .subscribe(() => this.navigationEditHandle(data));
  }

  /**
   * 菜单分类切换事件
   *
   * @param type
   */
  menuTypeActiveTabChange(type: string | number): void {
    this.systemsMenusForm.patchValue({ type });
    if (this.beforeEditData && this.beforeEditData.type !== type) {
      this.systemsMenusForm.get('type').markAsDirty();
    }

    this._systemsMenusFormHidden(<string>type);

    // 表单字段重置
    this._resetFormField();
  }

  /**
   * 上级菜单数据绑定事件
   *
   * @param event
   */
  parentMenuDataBound(event: DdtDataBoundEventArgs): void {
    if (this.systemsMenusForm) {
      this.parentMenuId = [this.systemsMenusForm.value.parentId?.toString() || ''];
    }
  }

  /**
   * 图标过滤筛选
   *
   * @param event
   */
  iconsFiltering(event: FilteringEventArgs): void {
    // 将过滤器数据源、过滤器查询传递给updateData方法
    event.updateData(this.iconDatas, this.gropDownListProvider.defaultQuery(event));
  }

  // ----------------------------------------------------------------------------
  // @ 私有方法
  // ----------------------------------------------------------------------------

  /**
   * 菜单表单字段显示和验证处理
   *
   * @returns
   */
  private _systemsMenusFormHidden(type: string): void {
    // 字段验证处理
    const parentIdControl = this.systemsMenusForm.get('parentId');
    const linkControl = this.systemsMenusForm.get('link');

    switch (type) {
      case 'basic':
        parentIdControl.removeValidators(Validators.required);
        parentIdControl.updateValueAndValidity();

        linkControl.addValidators(Validators.required);
        linkControl.updateValueAndValidity();
        break;
      case 'collapsable':
        parentIdControl.addValidators(Validators.required);
        parentIdControl.updateValueAndValidity();

        linkControl.removeValidators(Validators.required);
        linkControl.updateValueAndValidity();
        break;
      case 'group':
        parentIdControl.removeValidators(Validators.required);
        parentIdControl.updateValueAndValidity();

        linkControl.removeValidators(Validators.required);
        linkControl.updateValueAndValidity();
        break;
    }

    // 字段是否显示
    this.parentMenuHidden = type === 'group';
    this.parentMenuRequired = type !== 'basic';
    this.linkHidden = type !== 'basic';
  }

  /**
   * 菜单表单验证
   *
   * @returns
   */
  private _systemsMenusFormVerify(): boolean {
    // 上级菜单字段处理
    if (this.parentMenuId) {
      const parentId = isUndefined(this.parentMenuId[0]) ? null : +this.parentMenuId[0];
      this.systemsMenusForm.patchValue({ parentId });

      if (this.beforeEditData && this.beforeEditData.parentId !== parentId) {
        this.systemsMenusForm.get('parentId').markAsDirty();
      }
    }

    const linkControl = this.systemsMenusForm.get('link');

    // 数据验证
    if (this.systemsMenusForm.invalid) {
      const parentIdControl = this.systemsMenusForm.get('parentId');
      const iconControl = this.systemsMenusForm.get('icon');
      const titleControl = this.systemsMenusForm.get('title');

      if (parentIdControl.hasError('required')) {
        this.parentMenu.showPopup();
        this._wsMessageService.toast('warning', '请选择上级菜单!');
      } else if (iconControl.hasError('required')) {
        this.menusIcon.showPopup();
        this._wsMessageService.toast('warning', '请选择图标!');
      } else if (titleControl.hasError('required')) {
        this.menusTitle.focusIn();
        this._wsMessageService.toast('warning', '请输入标题!');
      } else if (linkControl.hasError('required')) {
        this.menusLink.focusIn();
        this._wsMessageService.toast('warning', '请输入路由地址!');
      }

      return false;
    }

    // 路由地址必须以/开头
    if (!linkControl.value.startsWith('/')) {
      this.systemsMenusForm.patchValue({ link: `/${linkControl.value}` });
    }

    // 数据是否修改过
    if (!this.systemsMenusForm.dirty) {
      this._wsMessageService.toast('warning', '暂无提交修改的数据!');
      return false;
    }

    return true;
  }

  /**
   * 表单字段重置
   */
  private _resetFormField(): void {
    this.beforeEditData = null;
    this.parentMenuId = [];
    this.systemsMenusForm.patchValue({ parentId: null, link: '', type: this.menuTypeActiveId });
  }
}
