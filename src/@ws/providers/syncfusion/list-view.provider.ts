import { Injectable } from '@angular/core';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-lists';

@Injectable({ providedIn: 'root' })
export class ListViewProvider {
  /** 字段设置 */
  readonly fields: FieldSettingsModel = { text: 'name', id: 'id' };
}
