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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChangeEventArgs, CheckBoxAllModule } from '@syncfusion/ej2-angular-buttons';
import { ListBoxAllModule, ListBoxChangeEventArgs, ListBoxComponent } from '@syncfusion/ej2-angular-dropdowns';
import { ListViewAllModule, ListViewComponent } from '@syncfusion/ej2-angular-lists';
import { ButtonPropsModel, DialogAllModule, DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Query } from '@syncfusion/ej2-data';
import { WsScrollbarDirective } from '@ws/directives/scrollbar';
import { ListData } from '@ws/interfaces';
import { DialogProvider, ListBoxProvider, ListViewProvider } from '@ws/providers';
import { WsMessageService } from '@ws/services/message';
import { filter, isEmpty, isUndefined } from 'lodash-es';
import { DropDownModule, IconModule, SearchModule } from 'ng-devui';

@Component({
  selector: 'ws-multiple-list',
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    WsScrollbarDirective,
    CheckBoxAllModule,
    DialogAllModule,
    ListBoxAllModule,
    ListViewAllModule,
    IconModule,
    DropDownModule,
    SearchModule,
  ],
})
export class WsMultipleListComponent implements OnChanges, OnInit {
  @ViewChild('dialog') dialog: DialogComponent;
  @ViewChild('listbox') listbox: ListBoxComponent;
  @ViewChild('listview') listview: ListViewComponent;

  /** 操作对象名称 */
  @Input() actionName: string = '成员';

  /** 操作对象量词 */
  @Input() actionQuantifier: string = '名';

  /** 待选择列表数据 */
  @Input() listboxData: ListData[];
  @Output() readonly listboxDataChange: EventEmitter<ListData[]> = new EventEmitter<ListData[]>();

  /** 操作成功事件 */
  @Output() readonly confirm: EventEmitter<number[]> = new EventEmitter<number[]>();

  /** 弹窗操作按钮 */
  dialogButtons: ButtonPropsModel[];

  /** 搜索文本 */
  searchText = '';

  /** 是否隐藏全选 */
  isHiddenChecked = false;

  /** 全选 */
  checkedAll = false;

  /** 是否隐藏已选择区域 */
  isHiddenSelected = true;

  /** 已选列表数据 */
  listviewData: ListData[] = [];

  /**
   * 构造函数
   */
  constructor(
    public dialogProvider: DialogProvider,
    public listBoxProvider: ListBoxProvider,
    public listViewProvider: ListViewProvider,
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
    // 表单数据
    if ('listboxData' in changes) {
      if (!isUndefined(this.listboxData) && this.listboxData.length === 0) this.isHiddenChecked = true;

      // 执行可观察对象
      this.listboxDataChange.next(changes.listboxData.currentValue);
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
   * 确定处理
   */
  confirmHandle(): void {
    // 判断是否有选择
    if (this.listviewData.length === 0) {
      this._wsMessageService.toast('warning', `没有选择任何一${this.actionQuantifier + this.actionName}`);
      return;
    }

    // 关闭弹窗
    this.dialog.hide();

    // 执行可观察对象
    this.confirm.next(this.listviewData.map(list => list.id));
  }

  /**
   * 弹窗打开事件
   *
   * @param args
   */
  dialogOpen(args: object): void {}

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
   * 待选择列表搜索
   *
   * @param text
   */
  onSearch(text: string) {
    // 搜索时隐藏全选
    if (this.listboxData.length > 0) this.isHiddenChecked = !isEmpty(text);

    this.listbox.filter(this.listboxData, new Query().where('name', 'contains', text, true));
  }

  /**
   * 全选变化事件
   *
   * @param args
   */
  checkboxChange(args: ChangeEventArgs): void {
    this.listbox.selectAll(args.checked);
  }
  /**
   * 清空已选择列表
   */
  clearSelected(): void {
    this.checkedAll = false;
    this.listbox.selectAll(this.checkedAll);
  }

  /**
   * 待选择列表变化事件
   *
   * @param args
   */
  listBoxChange(args: ListBoxChangeEventArgs): void {
    // 当鼠标点击选择时
    if (args.event instanceof PointerEvent || isUndefined(args.event)) {
      this.checkedAll = args.items.length === this.listboxData.length;

      // 已选择列表数据处理
      this.listviewData = <ListData[]>args.items;
    }

    // 是否显示已选择区域
    this.isHiddenSelected = !(args.items.length > 0);
  }

  /**
   * 已选择列表移除事件
   *
   * @param data
   */
  listViewRemove(data: ListData): void {
    // 已选择列表处理
    this.listviewData = filter(this.listviewData, list => list.id !== data.id);

    // 是否全选处理
    this.checkedAll = this.listviewData.length === this.listboxData.length;

    // 待选择列表处理
    this.listbox.selectItems(
      this.listboxData.map(list => list.name),
      false,
    );
    this.listbox.selectItems(this.listviewData.map(list => list.name));

    // 是否显示已选择区域
    this.isHiddenSelected = !(this.listviewData.length > 0);
  }

  // ----------------------------------------------------------------------------
  // @ 私有方法
  // ----------------------------------------------------------------------------

  /**
   * 重置状态
   */
  private _resetStatus(): void {
    this.searchText = '';
    this.isHiddenChecked = false;
    this.checkedAll = false;
    this.isHiddenSelected = true;
    this.listviewData = [];
    this.listbox.selectAll(false);
  }
}
