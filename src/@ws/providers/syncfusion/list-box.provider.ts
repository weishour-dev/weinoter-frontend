import { Injectable } from '@angular/core';
import {
  DataBoundEventArgs,
  FieldSettingsModel,
  FilteringEventArgs,
  ListBoxComponent,
  SelectionSettingsModel,
} from '@syncfusion/ej2-angular-dropdowns';
import { addClass } from '@syncfusion/ej2-base';
import { Query } from '@syncfusion/ej2-data';
import { isEmpty } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class ListBoxProvider {
  /** 字段设置 */
  readonly fields: FieldSettingsModel = { text: 'name', value: 'id' };

  /** 选择设置 */
  readonly selectionSettings: SelectionSettingsModel = { showCheckbox: true, showSelectAll: false };

  /**
   * 默认搜索条件
   *
   * @param event
   * @returns
   */
  defaultQuery(event: FilteringEventArgs): Query {
    let query: Query = new Query();
    query = !isEmpty(event.text) ? query.where('name', 'contains', event.text, true) : query;
    return query;
  }

  /**
   * 数据绑定事件
   *
   * @param args
   * @param listBoxInstance
   */
  dataBound(args: DataBoundEventArgs, listBoxInstance: ListBoxComponent): void {
    this.styleHandle(listBoxInstance);
  }

  /**
   * 样式处理
   *
   * @param listBoxInstance
   */
  styleHandle(listBoxInstance: ListBoxComponent): void {
    const textContents: NodeListOf<Element> = listBoxInstance.element.querySelectorAll('.e-list-item');
    textContents.length > 0 && addClass(textContents, 'group');
  }
}
