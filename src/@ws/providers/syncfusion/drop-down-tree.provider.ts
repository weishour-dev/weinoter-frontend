import { Injectable } from '@angular/core';
import { DropDownTreeComponent, TreeFilterType } from '@syncfusion/ej2-angular-dropdowns';
import type { SafeAny } from '@ws/types';

@Injectable({ providedIn: 'root' })
export class GropDownTreeProvider {
  /** 筛选类型 */
  readonly filterType: TreeFilterType = 'Contains';

  /** 字段设置 */
  fields(dataSource: object[]): SafeAny {
    return {
      dataSource: dataSource ?? [],
      value: 'id',
      text: 'name',
      expanded: 'expanded',
      parentValue: 'parentId',
      hasChildren: 'hasChildren',
    };
  }

  /**
   * 下拉树默认设置
   *
   * @param dropDownTreeInstance
   */
  defaultHandle(dropDownTreeInstance: DropDownTreeComponent): void {
    dropDownTreeInstance.noRecordsTemplate = '没有发现记录';

    /** 筛选类型 */
    dropDownTreeInstance.filterType = this.filterType;

    /** 可见性模式 */
    dropDownTreeInstance.mode = 'Delimiter';

    /** 是否显示复选框选项 */
    dropDownTreeInstance.showCheckBox = true;

    /** 是否启用过滤 */
    dropDownTreeInstance.allowFiltering = true;

    /** 是否显示清除按钮 */
    dropDownTreeInstance.showClearButton = true;
  }
}
