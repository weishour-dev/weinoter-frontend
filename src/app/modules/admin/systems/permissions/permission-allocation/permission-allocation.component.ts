import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Button, ChangeEventArgs, CheckBoxAllModule, CheckBoxComponent } from '@syncfusion/ej2-angular-buttons';
import { DataStateChangeEventArgs } from '@syncfusion/ej2-angular-grids';
import {
  AccordionAllModule,
  AccordionClickArgs,
  AccordionComponent,
  ClickEventArgs,
  DataBoundEventArgs,
  ExpandEventArgs,
  FieldsSettingsModel,
  NodeExpandEventArgs,
  NodeSelectEventArgs,
  ToolbarAllModule,
  TreeViewAllModule,
  TreeViewComponent,
} from '@syncfusion/ej2-angular-navigations';
import { ButtonPropsModel, DialogAllModule, DialogComponent } from '@syncfusion/ej2-angular-popups';
import { closest, select, selectAll } from '@syncfusion/ej2-base';
import { Predicate } from '@syncfusion/ej2-data';
import { WsDividerComponent } from '@ws/components/divider';
import { WsScrollbarDirective } from '@ws/directives/scrollbar';
import { ListDataSource } from '@ws/interfaces';
import { DialogProvider, ListBoxProvider, ListViewProvider, TreeViewProvider } from '@ws/providers';
import { WsMessageService } from '@ws/services/message';
import { WsUtilsService } from '@ws/services/utils';
import { MandateTargetType, MandateTargets, PermissionTypeItems } from 'app/core/constants';
import { MandatesService, ResourceItem } from 'app/core/systems/mandates';
import { MenuModel, MenusService } from 'app/core/systems/menus';
import { GroupPermissions, Permission, Permissions, PermissionsService } from 'app/core/systems/permissions';
import { filter, find, groupBy } from 'lodash-es';
import { IconModule, SearchModule, SplitterModule } from 'ng-devui';

@Component({
  selector: 'permission-allocation',
  templateUrl: './permission-allocation.component.html',
  styleUrls: ['./permission-allocation.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    DialogAllModule,
    SplitterModule,
    ToolbarAllModule,
    MatIconModule,
    MatDividerModule,
    SearchModule,
    TreeViewAllModule,
    WsScrollbarDirective,
    WsDividerComponent,
    AccordionAllModule,
    CheckBoxAllModule,
    IconModule,
  ],
})
export class PermissionAllocationComponent implements OnChanges, OnInit {
  @ViewChild('dialog') dialog: DialogComponent;
  @ViewChild('menusTreeview') menusTreeview: TreeViewComponent;
  @ViewChildren('acrdnInstance') acrdnInstances: QueryList<AccordionComponent>;
  @ViewChildren(WsScrollbarDirective) wsScrollbarDirectives: QueryList<WsScrollbarDirective>;

  /** 目标对象类型 */
  @Input() targetType: MandateTargetType;

  /** 目标对象id */
  @Input() targetId: number;

  /** 操作成功事件 */
  @Output() readonly confirm: EventEmitter<void> = new EventEmitter<void>();

  /** 目标对象名称 */
  targetName: string;

  /** 弹窗操作按钮 */
  dialogButtons: ButtonPropsModel[];

  /** 搜索文本 */
  searchText = '';

  /** 当前选中的菜单 */
  menuActiveId = 0;
  menuActive: ListDataSource;

  /** 菜单列表数据 */
  menuListFields: FieldsSettingsModel;
  /** 菜单列表数据 */
  menuListItems: MenuModel[] = [];

  /** 是否隐藏全选 */
  isHiddenChecked = false;

  /** 全选 */
  checkedAll = false;

  /** 权限分类数据 */
  permissionTypeItems = PermissionTypeItems;

  /** 目标对象权限列表数据 */
  mandatePermissionsLists: Permission[] = [];

  /** 权限列表数据 */
  systemsPermissionsLists: Permission[] = [];

  /** 分组权限列表数据 */
  groupPermissions: GroupPermissions[] = [];

  /** 折叠面板点击事件参数 */
  accordionClickEventArgs: Event;

  //#region 其他
  splitterCollapsible = false;
  /** 菜单折叠切换按钮 */
  menuCollapseBtn: Button;
  /** 权限折叠切换按钮 */
  mandateCollapseBtn: Button;
  //#endregion

  /**
   * 构造函数
   */
  constructor(
    public treeViewProvider: TreeViewProvider,
    public dialogProvider: DialogProvider,
    public listBoxProvider: ListBoxProvider,
    public listViewProvider: ListViewProvider,
    private _changeDetectorRef: ChangeDetectorRef,
    private _menusService: MenusService,
    private _permissionsService: PermissionsService,
    private _mandatesService: MandatesService,
    private _wsUtilsService: WsUtilsService,
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
    // 目标对象类型
    if ('targetType' in changes) {
      this.targetName = find(MandateTargets, target => target.value === this.targetType)?.name;
    }
  }

  /**
   * 视图初始化后
   */
  ngOnInit(): void {
    // 弹窗按钮
    this.dialogButtons = [
      {
        buttonModel: this.dialogProvider.cancelButton,
        click: () => this.dialog.hide(),
      },
      {
        buttonModel: this.dialogProvider.confirmButton,
        click: () => this.confirmHandle(),
      },
    ];
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
      this.menuListFields = this.treeViewProvider.fields(this.menuListItems as ListDataSource[], {
        text: 'title',
      });

      // 消息提示
      if (message !== '') this._wsMessageService.toast('success', message);

      // 按钮状态
      if (this.menuCollapseBtn.content === '展开') this.menuCollapseBtn.click();

      // 检测变更
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * 初始化数据
   *
   * @param message
   */
  initSystemsPermissionsData(message: string = ''): void {
    // 获取列表数据
    const state: DataStateChangeEventArgs = {
      where: [new Predicate('status', 'equal', 1)],
    };

    // 目标对象权限
    this._mandatesService
      .permissions({ targetType: this.targetType, targetId: this.targetId })
      .subscribe(mandatePermissions => {
        this.mandatePermissionsLists = mandatePermissions;
        const permissionIds = this.mandatePermissionsLists.map(permission => permission.id);

        // 系统所有权限
        this._permissionsService.getData(state).subscribe(data => {
          this.systemsPermissionsLists = data.result;

          this.groupPermissions = [];

          // 所有权限节点
          const AllGroupPermissions = groupBy(this.systemsPermissionsLists, 'menuId');
          for (const menuId in AllGroupPermissions) {
            if (Object.prototype.hasOwnProperty.call(AllGroupPermissions, menuId)) {
              const menu = find(this.menuListItems, { id: +menuId });

              const permissions: Permissions[] = [];
              const groupPermissions = groupBy(AllGroupPermissions[menuId], 'type');
              for (const key in groupPermissions) {
                if (Object.prototype.hasOwnProperty.call(groupPermissions, key)) {
                  const type = key;
                  const indeterminate = false;
                  const name = <string>find(this.permissionTypeItems, { id: type }).title;
                  const items = groupPermissions[type].map(groupPermission => {
                    groupPermission.checked = permissionIds.includes(groupPermission.id);
                    return groupPermission;
                  });
                  const checkedItems = filter(items, { checked: true });
                  const checked = checkedItems.length === items.length;

                  permissions.push({ type, checked, indeterminate, name, items });
                }
              }

              this.groupPermissions.push({
                id: menu.id,
                icon: menu.icon,
                title: menu.title,
                hidden: false,
                permissions,
              });
            }
          }

          // 权限数据显示处理
          this._permissionsHandle();

          if (message !== '') this._wsMessageService.toast('success', message);

          // 检测变更
          this._changeDetectorRef.markForCheck();
        });
      });
  }

  /**
   * 确定处理
   */
  confirmHandle(): void {
    const permissionIds: number[] = [];
    let resources: ResourceItem[] = [];

    // 获取所有分类权限数据
    for (const groupPermission of this.groupPermissions) {
      for (const permission of groupPermission.permissions) {
        const resource: ResourceItem = { type: '', actions: [] };
        resource.type = permission.type;

        for (const item of permission.items) {
          if (item.checked) {
            permissionIds.push(item.id);
            resource.actions.push(item.id);
          }
        }

        // 判断是否选择权限节点
        if (resource.actions.length > 0) resources.push(resource);
      }
    }

    // 对相同类型的权限进行合并处理
    resources = resources.reduce((datas, item) => {
      const data = find(datas, { type: item.type });
      if (data) {
        data.actions.push(...item.actions);
      } else {
        datas.push(item);
      }
      return datas;
    }, [] as ResourceItem[]);

    // 分配权限
    this._mandatesService
      .allot({ targetType: this.targetType, targetId: this.targetId, permissionIds, resources })
      .subscribe({
        next: () => {
          // 关闭弹窗
          this.dialog.hide();

          // 执行可观察对象
          this.confirm.next();
        },
      });
  }

  /**
   * 弹窗打开事件
   *
   * @param args
   */
  dialogOpen(args: object): void {
    this.initMenusData();

    this.wsScrollbarDirectives.forEach(wsScrollbarDirective => {
      wsScrollbarDirective.scrollToY(0, 1);
    });
  }

  /**
   * 弹窗关闭事件
   *
   * @param args
   */
  dialogClose(args: object): void {
    // 重置状态
    this._resetStatus();
  }

  /**
   * 分割器是否折叠事件
   *
   * @param collapsed
   */
  collapsedChange(collapsed: boolean): void {
    // 权限数据显示处理
    this._permissionsHandle();
  }

  /**
   * 树列表工具栏创建事件
   *
   * @param args
   */
  treeviewToolbarCreated(): void {
    this.menuCollapseBtn = new Button({
      cssClass: `e-tbar-btn e-tbtn-txt e-control e-btn e-lib px-1.5 dark:text-white`,
      iconCss: 'icon icon-collapse-info text-primary',
      isToggle: true,
      content: '折叠',
    });
    this.menuCollapseBtn.appendTo('#menu_collapse_btn');

    // 先检查是否已经有绑定的事件处理函数
    if (this.menuCollapseBtn.element.onclick) {
      // 如果已经有绑定的事件处理函数，先解绑
      this.menuCollapseBtn.element.removeEventListener('click', this.collapseClickHandler);
    }

    // 绑定新的事件处理函数
    this.menuCollapseBtn.element.onclick = this.collapseClickHandler;
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
   * 折叠切换按钮点击事件
   */
  collapseClickHandler = (): void => {
    if (this.menuCollapseBtn.element.classList.contains('e-active')) {
      this.menuCollapseBtn.content = '展开';
      this.menuCollapseBtn.iconCss = 'icon icon-expand-info text-primary';

      // 折叠一级节点
      this.menusTreeview.collapseAll(null, 1);
    } else {
      this.menuCollapseBtn.content = '折叠';
      this.menuCollapseBtn.iconCss = 'icon icon-collapse-info text-primary';

      // 展开一级节点
      this.menusTreeview.expandAll(null, 1);
    }
  };

  /**
   * 待选择列表搜索
   *
   * @param text
   */
  onSearch(text: string) {
    // 搜索时隐藏全选
    // if (this.listboxData.length > 0) this.isHiddenChecked = !isEmpty(text);
    // this.listbox.filter(this.listboxData, new Query().where('name', 'contains', text, true));
  }

  /**
   * 树列表数据绑定事件
   *
   * @param args
   */
  treeviewDataBound(args: DataBoundEventArgs): void {
    if (args.data.length === 0) return;

    const selectedNodes = this.menusTreeview.selectedNodes;
    const selectedNodeData = this.menusTreeview.getNode(selectedNodes[0]);
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

    // 权限数据显示处理
    this._permissionsHandle();

    // 权限折叠切换按钮状态
    if (this.mandateCollapseBtn.content === '展开') {
      this.mandateCollapseBtn.click();
      this.mandateCollapseBtn.content = '折叠';
      this.mandateCollapseBtn.iconCss = 'e-icons e-chevron-down text-primary';
    }
  }

  /**
   * 折叠面板工具栏创建事件
   */
  accordionToolbarCreated(): void {
    this.mandateCollapseBtn = new Button({
      cssClass: `e-tbar-btn e-tbtn-txt e-control e-btn e-lib px-1.5 dark:text-white`,
      iconCss: 'e-icons e-chevron-down text-primary',
      isToggle: true,
      content: '折叠',
    });
    this.mandateCollapseBtn.appendTo('#mandate_collapse_btn');

    this.mandateCollapseBtn.element.onclick = (): void => {
      if (this.mandateCollapseBtn.element.classList.contains('e-active')) {
        this.mandateCollapseBtn.content = '展开';
        this.mandateCollapseBtn.iconCss = 'e-icons e-chevron-up text-primary';

        // 折叠一级节点
        this.acrdnInstances.forEach(acrdnInstance => acrdnInstance.expandItem(false));
      } else {
        this.mandateCollapseBtn.content = '折叠';
        this.mandateCollapseBtn.iconCss = 'e-icons e-chevron-down text-primary';

        // 展开一级节点
        this.acrdnInstances.forEach(acrdnInstance => acrdnInstance.expandItem(true));
      }
    };
  }

  /**
   * 折叠面板工具栏点击事件
   *
   * @param args
   */
  accordionToolbarClick(args: ClickEventArgs): void {
    switch (args.item.id) {
      case 'checkAll':
        this._checkAllHandle(true);
        break;
      case 'unCheckAll':
        this._checkAllHandle(false);
        break;
      case 'refresh':
        this.initSystemsPermissionsData('权限刷新成功');
        break;
    }
  }

  /**
   * 折叠面板点击事件
   *
   * @param args
   */
  expandingClicked(args: AccordionClickArgs): void {
    this.accordionClickEventArgs = args.originalEvent;
  }

  /**
   * 折叠面板展开事件
   *
   * @param args
   */
  expandingAccordion(args: ExpandEventArgs): void {
    if (this.accordionClickEventArgs) {
      const header = closest(this.accordionClickEventArgs.target as Element, '.e-acrdn-header');
      const checkboxType = closest(this.accordionClickEventArgs.target as Element, '.e-checkbox-wrapper');
      const toggleIcon = closest(this.accordionClickEventArgs.target as Element, '.e-toggle-icon');
      const content = args.content;

      // 折叠面板全选
      if (checkboxType) {
        const checkBoxTypeInstance: CheckBoxComponent = this.accordionClickEventArgs.target['ej2_instances'][0];

        const checkboxs = selectAll('.e-control.e-checkbox', content);
        checkboxs.forEach(checkbox => {
          const checkboxInstance: CheckBoxComponent = checkbox['ej2_instances'][0];
          checkboxInstance.checked = checkBoxTypeInstance.checked;
        });
      }

      // 重置点击事件参数
      this.accordionClickEventArgs = null;

      // 点击折叠切换按钮
      if (header && !toggleIcon) {
        args.cancel = true;
        return;
      }
    }
  }

  /**
   * 分类权限全选改变事件
   *
   * @param args
   */
  checkboxTypeChange(args: ChangeEventArgs): void {
    const event: Event = args.event;
    if (event.target['tagName'] === 'EJS-CHECKBOX') {
      const accordion = closest(event.target as Element, '.e-control.e-accordion');
      const checkboxs = selectAll('.e-acrdn-panel .e-control.e-checkbox', accordion);

      checkboxs.forEach(checkbox => {
        const checkboxInstance: CheckBoxComponent = checkbox['ej2_instances'][0];
        checkboxInstance.checked = args.checked;
      });
    }
  }

  /**
   * 权限选择改变事件
   *
   * @param args
   */
  checkboxChange(args: ChangeEventArgs): void {
    const event: Event = args.event;
    const accordion = closest(event.target as Element, '.e-control.e-accordion');
    const header = select('.e-acrdn-header', accordion);
    const content = select('.e-acrdn-content', accordion);

    if (header && content) {
      const checkboxType = select('.e-control.e-checkbox', header);
      const checkboxTypeInstance: CheckBoxComponent = checkboxType['ej2_instances'][0];
      const checkboxs = selectAll('.e-control.e-checkbox', content);
      const totalCount = checkboxs.length;
      let selectedCount = 0;
      let unselectedCount = 0;

      // 统计选择、未选数量
      checkboxs.forEach(checkbox => {
        const checkboxInstance: CheckBoxComponent = checkbox['ej2_instances'][0];

        if (checkboxInstance.checked) {
          selectedCount++;
        } else {
          unselectedCount++;
        }
      });

      // 判断全选、未选、模糊状态
      if (totalCount === selectedCount) {
        checkboxTypeInstance.checked = true;
        checkboxTypeInstance.indeterminate = false;
      } else if (totalCount === unselectedCount) {
        checkboxTypeInstance.checked = false;
        checkboxTypeInstance.indeterminate = false;
      } else {
        checkboxTypeInstance.checked = false;
        checkboxTypeInstance.indeterminate = true;
      }
    }
  }

  // ----------------------------------------------------------------------------
  // @ 私有方法
  // ----------------------------------------------------------------------------

  /**
   * 重置状态
   */
  private _resetStatus(): void {
    this.accordionClickEventArgs = null;
  }

  /**
   * 权限数据处理
   */
  private _permissionsHandle(): void {
    if (this.splitterCollapsible) {
      this.groupPermissions.map(groupPermission => {
        groupPermission.hidden = false;
        return groupPermission;
      });
    } else {
      this.groupPermissions.map(groupPermission => {
        groupPermission.hidden = this.menuActiveId !== groupPermission.id;
        return groupPermission;
      });
    }
  }

  /**
   * 全选\取消处理
   *
   * @param checked
   */
  private _checkAllHandle(checked: boolean): void {
    if (this.splitterCollapsible) {
      for (const groupPermission of this.groupPermissions) {
        for (const permission of groupPermission.permissions) {
          permission.checked = checked;
          for (const item of permission.items) {
            item.checked = checked;
          }
        }
      }
    } else {
      const groupPermission = find(this.groupPermissions, { id: this.menuActiveId });
      for (const permission of groupPermission.permissions) {
        permission.checked = checked;
        for (const item of permission.items) {
          item.checked = checked;
        }
      }
    }
  }
}
