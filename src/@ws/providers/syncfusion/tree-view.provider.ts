import { Injectable } from '@angular/core';
import {
  DataBoundEventArgs,
  DataSourceChangedEventArgs,
  FieldsSettingsModel,
  NodeExpandEventArgs,
  TreeViewComponent,
} from '@syncfusion/ej2-angular-navigations';
import { addClass } from '@syncfusion/ej2-base';
import { DataManager, Query } from '@syncfusion/ej2-data';
import { ListDataSource } from '@ws/interfaces';

@Injectable({ providedIn: 'root' })
export class TreeViewProvider {
  /** 字段设置 */
  fields(dataSource: DataManager | ListDataSource[], fieldsSettings: FieldsSettingsModel = {}): FieldsSettingsModel {
    return {
      dataSource,
      id: 'id',
      text: 'name',
      expanded: 'expanded',
      parentID: 'parentId',
      hasChildren: 'hasChildren',
      selected: 'selected',
      ...fieldsSettings,
    };
  }

  /**
   * 组件创建后
   *
   * @param args
   * @param treeViewInstance
   */
  created(args: object, treeViewInstance: TreeViewComponent): void {
    this.styleHandle(treeViewInstance);
  }

  /**
   * 数据绑定事件
   *
   * @param args
   * @param treeViewInstance
   */
  dataBound(args: DataBoundEventArgs, treeViewInstance: TreeViewComponent): void {
    this.styleHandle(treeViewInstance);
  }

  /**
   * 数据绑定更改事件
   *
   * @param args
   * @param treeViewInstance
   */
  dataSourceChanged(args: DataSourceChangedEventArgs, treeViewInstance: TreeViewComponent): void {
    this.styleHandle(treeViewInstance);
  }

  /**
   * 节点展开事件
   *
   * @param args
   * @param treeViewInstance
   */
  nodeExpanded(args: NodeExpandEventArgs, treeViewInstance: TreeViewComponent): void {
    this.styleHandle(treeViewInstance);
  }

  /**
   * 样式处理
   *
   * @param treeViewInstance
   */
  styleHandle(treeViewInstance: TreeViewComponent): void {
    const textContents: NodeListOf<Element> = treeViewInstance.element.querySelectorAll('.e-text-content');
    textContents.length > 0 && addClass(textContents, 'group');
  }

  /**
   * 查找相应子节点的父节点
   *
   * @param fList
   * @param list
   * @returns
   */
  getFilterItems(fList, list) {
    const nodes = [];
    nodes.push(fList['id']);

    const query2 = new Query().where('id', 'equal', fList['parentId'] === null ? undefined : fList['parentId'], false);
    const fList1 = new DataManager(list).executeLocal(query2);

    if (fList1.length !== 0) {
      const pNode = this.getFilterItems(fList1[0], list);
      for (let i = 0; i < pNode.length; i++) {
        if (nodes.indexOf(pNode[i]) === -1 && pNode[i] != null) {
          nodes.push(pNode[i]);
        }
        return nodes;
      }
      return nodes;
    }
    return nodes;
  }
}
