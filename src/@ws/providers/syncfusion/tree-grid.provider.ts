import { Injectable, Injector } from '@angular/core';
import {
  EditSettingsModel,
  FailureEventArgs,
  FilterSettingsModel,
  GridLine,
  PageSettingsModel,
  RowDropSettingsModel,
  SearchSettingsModel,
  SelectionSettingsModel,
  SortSettingsModel,
  TextWrapSettingsModel,
  ToolbarItems,
} from '@syncfusion/ej2-angular-grids';
import { ClickEventArgs, ItemModel } from '@syncfusion/ej2-angular-navigations';
import { BeforeOpenEventArgs, ButtonPropsModel, Dialog, DialogModel } from '@syncfusion/ej2-angular-popups';
import { TreeGridComponent } from '@syncfusion/ej2-angular-treegrid';
import {
  addClass,
  DateFormatOptions,
  includeInnerHTML,
  isNullOrUndefined,
  isUndefined,
  removeClass,
  select,
  setStyleAttribute,
} from '@syncfusion/ej2-base';
import { DataManager } from '@syncfusion/ej2-data';
import { Result } from '@ws/interfaces';
import { WsMessageService } from '@ws/services/message';
import { GridService } from '@ws/services/utils';
import { SafeAny } from '@ws/types';
import { AuthService } from 'app/core/auth';
import { cloneDeep, isNull } from 'lodash-es';
import { map } from 'rxjs';
import { DialogProvider } from './dialog.provider';

@Injectable({ providedIn: 'root' })
export class TreeGridProvider {
  private _authService: AuthService;

  constructor(
    private injector: Injector,
    private _dialogProvider: DialogProvider,
    private _gridService: GridService,
    private _wsMessageService: WsMessageService,
  ) {
    setTimeout(() => (this._authService = injector.get(AuthService)));

    this.toolbarWithBatchAdd.splice(1, 0, {
      text: '批量新增',
      tooltipText: '批量新增',
      prefixIcon: 'e-group-2',
      id: 'batchAdd',
    });

    this.toolbarWithSwitch.splice(3, 0, { type: 'Separator' });
    this.toolbarWithSwitch.splice(4, 0, {
      text: '启用',
      tooltipText: '启用',
      prefixIcon: 'e-circle-check text-green-500',
      id: 'enable',
    });
    this.toolbarWithSwitch.splice(5, 0, {
      text: '禁用',
      tooltipText: '禁用',
      prefixIcon: 'e-circle-close text-red-500',
      id: 'disable',
    });
  }

  /** 表格线 */
  readonly gridLines: GridLine = 'Default';

  /** 工具栏 */
  readonly toolbar: (ToolbarItems | ItemModel)[] = [
    { text: 'Add', tooltipText: '新增', prefixIcon: 'e-plus-2 text-green-500' },
    { text: 'Edit', tooltipText: '修改', prefixIcon: 'e-edit text-blue-500' },
    { text: 'Delete', tooltipText: '删除', prefixIcon: 'e-delete-1 text-red-500' },
    { type: 'Separator' },
    { text: 'Print', tooltipText: '打印', prefixIcon: 'e-print' },
    { text: 'ExcelExport', tooltipText: 'Excel 导出', prefixIcon: 'e-excelexport text-green-500' },
    { type: 'Separator' },
    { text: '刷新', tooltipText: '刷新', prefixIcon: 'e-refresh-2 text-green-500', id: 'refresh' },
    // { text: 'ColumnChooser', tooltipText: '列显示' },
    { type: 'Separator', align: 'Right' },
    { text: 'Search' },
  ];

  /** 工具栏 (带批量新增) */
  readonly toolbarWithBatchAdd = cloneDeep(this.toolbar);

  /** 工具栏 (带开关(启用/禁用)) */
  readonly toolbarWithSwitch = cloneDeep(this.toolbar);

  /** 编辑设置 */
  readonly editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Dialog',
    allowEditOnDblClick: true,
    showConfirmDialog: true,
    showDeleteConfirmDialog: true,
    template: '',
    newRowPosition: 'Top',
    dialog: {
      params: {
        animationSettings: this._dialogProvider.animationSettings,
        beforeOpen: (args: BeforeOpenEventArgs) => {
          const instances = args.element['ej2_instances'];
          const dialog: Dialog = instances[0];

          // 设置按钮
          const saveButton: ButtonPropsModel = dialog.buttons[0];
          saveButton.buttonModel.iconCss = this._dialogProvider.saveButton.iconCss;
          const cancelButton: ButtonPropsModel = dialog.buttons[1];
          cancelButton.buttonModel.iconCss = this._dialogProvider.cancelButton.iconCss;
          cancelButton.click = () => dialog.hide();
          dialog.buttons = [cancelButton, saveButton];
          dialog.dataBind();
        },
      },
    },
    allowNextRowEdit: false,
  };

  /** 排序设置 */
  readonly sortSettings: SortSettingsModel = {
    columns: [],
    allowUnsort: true,
  };

  /** 分页设置 */
  readonly pageSettings: PageSettingsModel = {
    pageSize: 20,
    pageCount: 8,
    currentPage: 1,
    enableQueryString: false,
    pageSizes: true,
    template: null,
  };

  /** 过滤设置 */
  readonly filterSettings: FilterSettingsModel = {
    columns: [],
    type: 'Menu',
    mode: 'Immediate',
    showFilterBarStatus: true,
    immediateModeDelay: 1500,
    operators: null,
    ignoreAccent: false,
    enableCaseSensitivity: false,
    showFilterBarOperator: false,
  };

  /** 搜索设置 */
  readonly searchSettings: SearchSettingsModel = {
    fields: [],
    key: '',
    operator: 'contains',
    ignoreCase: true,
    ignoreAccent: false,
  };

  /** 拖拽设置 */
  readonly rowDropSettings: RowDropSettingsModel = {
    targetID: null,
  };

  /** 换行设置 */
  readonly textWrapSettings: TextWrapSettingsModel = {
    wrapMode: 'Content',
  };

  /** 选择设置 */
  readonly selectionSettings: SelectionSettingsModel = {
    mode: 'Row',
    cellSelectionMode: 'Flow',
    type: 'Single',
    checkboxOnly: false,
    persistSelection: false,
    checkboxMode: 'ResetOnRowClick',
    enableSimpleMultiRowSelection: false,
    enableToggle: true,
    allowColumnSelection: false,
  };

  /** 日期时间格式 */
  readonly dateTimeFormat: string | DateFormatOptions = {
    type: 'dateTime',
    format: 'yyyy-MM-dd HH:mm:ss',
  };

  /**
   * 组件创建后
   *
   * @param args
   */
  created(args: object, treeGridInstance: TreeGridComponent): void {
    // 工具栏处理
    this.toolbarHandle(treeGridInstance, 'text');
  }

  /**
   * 数据绑定后
   *
   * @param args
   */
  dataBound(args: object, treeGridInstance: TreeGridComponent): void {
    // 工具栏处理
    this.toolbarHandle(treeGridInstance, 'isEnable');

    // 自动调整所有列
    treeGridInstance.autoFitColumns();
  }

  /**
   * 操作失败
   *
   * @param args
   */
  actionFailure(args: FailureEventArgs): void {
    const response: Response = isUndefined(args.error) ? args[0]?.error : args.error[0]?.error;

    if (response) {
      response.text().then(text => {
        const result: Result = JSON.parse(text);

        // 刷新token请求处理
        if (!result.status && result.code === 401) {
          this._authService
            .refreshTokenRequest()
            .pipe(
              map(result => {
                if (result.status) {
                  this._wsMessageService.toast('info', '认证已更新，请继续操作');
                }
                return result;
              }),
            )
            .subscribe();
        } else {
          if (!result.status) {
            this._wsMessageService.error(result.message);
          }
        }
      });
    }
  }

  /**
   * 数据格式化
   *
   * @param json
   * @returns
   */
  formatColumn<T = SafeAny>(json: T[]): T[] {
    json.map(column => {
      if (!isUndefined(column['description']) && isNull(column['description'])) column['description'] = '';
      if (!isUndefined(column['about']) && isNull(column['about'])) column['about'] = '';

      if (!isNullOrUndefined(column['birthTime'])) column['birthTime'] = new Date(column['birthTime']);
      if (!isNullOrUndefined(column['insertTime'])) column['insertTime'] = new Date(column['insertTime']);
      if (!isNullOrUndefined(column['createdTime'])) column['createdTime'] = new Date(column['createdTime']);
      if (!isNullOrUndefined(column['updatedTime'])) column['updatedTime'] = new Date(column['updatedTime']);

      return column;
    });

    return json;
  }

  /**
   * 获取DataManager
   *
   * @param apiType
   * @param json
   * @returns
   */
  getDataManager(apiType: string, json: object[]): DataManager {
    return this._gridService.getDataManager({
      json,
      insertUrl: `${apiType}/grid/add`,
      updateUrl: `${apiType}/grid/edit`,
      removeUrl: `${apiType}/grid/remove`,
      batchUrl: `${apiType}/grid/batch`,
    });
  }

  /**
   * 表格默认设置
   *
   * @param gridInstance
   */
  defaultHandle(gridInstance: TreeGridComponent): void {
    gridInstance.width = '100%';
    gridInstance.height = '100%';
    gridInstance.rowHeight = 38;

    /** 键盘交互 */
    gridInstance.allowKeyboard = true;

    /** 换行 */
    gridInstance.allowTextWrap = true;
    gridInstance.textWrapSettings = this.textWrapSettings;

    /** 分页 */
    gridInstance.allowPaging = false;
    gridInstance.pageSettings = this.pageSettings;

    /** 排序 */
    gridInstance.allowSorting = true;
    gridInstance.sortSettings = this.sortSettings;

    /** 多列排序 */
    gridInstance.allowMultiSorting = true;

    /** Excel导出 */
    gridInstance.allowExcelExport = true;

    /** Pdf导出 */
    gridInstance.allowPdfExport = true;

    /** 选择 */
    gridInstance.allowSelection = true;
    gridInstance.selectionSettings = this.selectionSettings;

    /** 过滤 */
    gridInstance.allowFiltering = true;
    gridInstance.filterSettings = this.filterSettings;

    /** 重新排序 */
    gridInstance.allowReordering = true;

    /** 调整大小 */
    gridInstance.allowResizing = true;

    /** 将行拖放到另一个表格 */
    gridInstance.allowRowDragAndDrop = false;
    gridInstance.rowDropSettings = this.rowDropSettings;

    /** 列菜单选项 */
    gridInstance.showColumnMenu = false;

    /** 列显示选项 */
    gridInstance.showColumnChooser = true;

    /** 虚拟滚动 */
    gridInstance.enableVirtualization = false;
    gridInstance.enableColumnVirtualization = false;

    /** 无限滚动 */
    gridInstance.enableInfiniteScrolling = false;

    /** 网格线 */
    gridInstance.gridLines = this.gridLines;

    /** 搜索设置 */
    gridInstance.searchSettings = this.searchSettings;
  }

  /**
   * 工具栏点击事件
   *
   * @param args
   */
  defaultToolbarClick(args: ClickEventArgs, gridId: string, treeGridInstance: TreeGridComponent): void {
    switch (args.item.id) {
      // Excel 导出
      case `${gridId}_excelexport`:
      case `${gridId}_gridcontrol_excelexport`:
        treeGridInstance.excelExport();
        break;
      // Pdf 导出
      case `${gridId}_pdfexport`:
      case `${gridId}_gridcontrol_pdfexport`:
        treeGridInstance.pdfExport();
        break;
      // Csv 导出
      case `${gridId}_csvexport`:
      case `${gridId}_gridcontrol_csvexport`:
        treeGridInstance.csvExport();
        break;
      // 刷新
      case `refresh`:
        // 清除过滤
        treeGridInstance.clearFiltering();
        // 清除排序
        treeGridInstance.clearSorting();
        // 清除搜索
        treeGridInstance.search('');
        break;
    }
  }

  /**
   * 工具栏处理
   *
   * @param gridInstance
   * @param type
   */
  toolbarHandle(gridInstance: TreeGridComponent, type: 'text' | 'isEnable'): void {
    const grid = gridInstance.grid;
    const toolbarModule = grid.toolbarModule;
    const toolbar = toolbarModule.toolbar;
    const tbarEle = toolbar['tbarEle'];

    switch (type) {
      case 'text':
        // 工具栏按钮文本显示处理
        for (const tbar of tbarEle) {
          if (!tbar.classList.contains('e-separator')) {
            setStyleAttribute(tbar, { background: 'var(--ws-bg-card)' });
            const buttonIcon = select('.e-icons', tbar);
            const buttonText = select('.e-tbar-btn-text', tbar);

            // 按钮图标
            if (!isNull(buttonIcon) && !buttonIcon.className.match('text-')) {
              addClass([buttonIcon], 'text-primary');
            }

            // 按钮文本
            if (!isNull(buttonText)) includeInnerHTML(buttonText, tbar.title);
          }
        }
        break;
      case 'isEnable':
        // 工具栏按钮启用禁用处理
        const rowsObject = grid.getRowsObject();
        for (const tbar of tbarEle) {
          if (!tbar.classList.contains('e-separator')) {
            setStyleAttribute(tbar, { background: 'var(--ws-bg-card)' });
            const button = select('.e-tbar-btn', tbar);

            // 禁用处理
            if (
              !isNull(button) &&
              ['systems_users_grid_edit', 'systems_users_grid_delete', 'auth', 'remove', 'enable', 'disable'].includes(
                button.id,
              )
            ) {
              toolbarModule.enableItems([button.id], rowsObject.length > 0);
            }

            // 禁用样式
            if (tbar.className.match('e-overlay')) {
              addClass([tbar], ['cursor-not-allowed', 'pointer-events-auto']);
              if (!isNull(button)) addClass([button], ['cursor-not-allowed']);
            } else {
              removeClass([tbar], ['cursor-not-allowed', 'pointer-events-auto']);
              if (!isNull(button)) removeClass([button], ['cursor-not-allowed']);
            }
          }
        }
        break;
    }
  }

  /**
   * 弹窗处理
   *
   * @param dialogInstance
   * @param header
   */
  dialogHandle(dialogInstance: DialogModel, header: string): void {
    const dialog = <Dialog>dialogInstance;

    // 设置标题
    dialog.header = header;
  }

  /**
   * 状态处理
   *
   * @param type
   * @param data
   * @returns
   */
  statusHandle = (type: string, data: object) => this._gridService.statusHandle(type, data);

  /**
   * 筛选列表处理
   */
  filterItemsHandle = (data: SafeAny) => this._gridService.filterItemsHandle(data);
}
