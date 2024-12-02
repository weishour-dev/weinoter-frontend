import { Injectable } from '@angular/core';
import { FieldSettingsModel, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { Query } from '@syncfusion/ej2-data';
import { isEmpty } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class GropDownListProvider {
  /** 字段设置 */
  readonly fields: FieldSettingsModel = { text: 'name', value: 'id' };

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
}
