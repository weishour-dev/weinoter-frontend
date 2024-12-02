import { Injectable } from '@angular/core';
import { SaveEventArgs } from '@syncfusion/ej2-angular-grids';
import { AdaptorOptions, DataManager, DataOptions, Query } from '@syncfusion/ej2-data';
import { GridAdaptor } from '@ws/common/adaptors';
import { WsMessageService } from '@ws/services/message';
import { StorageService } from '@ws/services/storage';
import { WsDialogService } from '@ws/services/utils';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class GridService {
  private apiUrl: string;

  constructor(
    private _storageService: StorageService,
    private _wsMessageService: WsMessageService,
    private _wsDialogService: WsDialogService,
  ) {
    this.apiUrl = environment.BASE_API;
  }

  /**
   * 获取DataManager
   *
   * @param dataSource
   * @param query
   * @param adaptor
   * @return: DataManager
   */
  getDataManager(
    dataSource?: DataOptions | JSON[] | object[],
    query?: Query,
    adaptor?: string | AdaptorOptions,
  ): DataManager {
    dataSource['insertUrl'] = dataSource['insertUrl'] ? this.apiUrl + dataSource['insertUrl'] : '';
    dataSource['updateUrl'] = dataSource['updateUrl'] ? this.apiUrl + dataSource['updateUrl'] : '';
    dataSource['removeUrl'] = dataSource['removeUrl'] ? this.apiUrl + dataSource['removeUrl'] : '';
    dataSource['batchUrl'] = dataSource['batchUrl'] ? this.apiUrl + dataSource['batchUrl'] : '';

    return new DataManager(
      {
        headers: [{ Authorization: `Bearer ${this._storageService.get<string>('accessToken')}` }],
        adaptor: new GridAdaptor(this._storageService, this._wsMessageService),
        ...dataSource,
      },
      query,
      adaptor,
    );
  }

  /**
   * 状态处理
   *
   * @param type
   * @param data
   * @returns
   */
  statusHandle(type: string, data: object): string {
    let title = '';

    switch (type) {
      case 'status':
      case 'reuse':
      case 'reuseCloseable':
        title = data[type] ? '启用' : '禁用';
        break;
      case 'disabled':
        title = data[type] ? '禁用' : '启用';
        break;
      case 'hidden':
        title = data[type] ? '隐藏' : '显示';
        break;
      case 'isMaster':
      case 'isSystem':
        title = data[type] ? '是' : '否';
        break;
    }

    return title;
  }

  /**
   * 筛选列表处理
   */
  filterItemsHandle({ column, ...args }): string {
    switch (column.field) {
      case 'status':
      case 'reuse':
      case 'reuseCloseable':
      case 'disabled':
      case 'hidden':
      case 'isSystem':
        return this.statusHandle(column.field, args);
    }
  }

  /**
   * 表格数据删除前处理
   *
   * @param args
   * @returns
   */
  deleteBeginHandle(args: SaveEventArgs): boolean {
    let cancel = false;

    if (args.requestType === 'delete') {
      const rowData = args.data[0];

      if (rowData.isSystem) {
        const alertDialog = this._wsDialogService.alert('error', {
          title: `删除失败`,
          content: `系统内置数据禁止删除。`,
          okButton: {
            click: () => alertDialog.hide(),
          },
        });
        cancel = true;
      }
    }

    return cancel;
  }
}
