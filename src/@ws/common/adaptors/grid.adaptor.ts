import { DataResult } from '@syncfusion/ej2-angular-grids';
import { isObject, isUndefined } from '@syncfusion/ej2-base';
import { RemoteSaveAdaptor } from '@syncfusion/ej2-data';
import { BatchGrid, InsertGrid, ParamsOptions, RemoveGrid, UpdateGrid } from '@ws/interfaces';
import { WsMessageService } from '@ws/services/message';
import { StorageService } from '@ws/services/storage';

export class GridAdaptor extends RemoteSaveAdaptor {
  public insertArgs: InsertGrid = {};
  public removeArgs: RemoveGrid = {};
  public updateArgs: UpdateGrid = {};
  public batchArgs: BatchGrid = {};
  public paramsArgs: ParamsOptions = {};

  constructor(
    private _storageService: StorageService,
    private _wsMessageService: WsMessageService,
  ) {
    super();
  }

  /**
   * 新增
   *
   * @returns
   */
  insert(): object {
    return super.insert.apply(this, arguments);
  }

  /**
   * 删除
   *
   * @returns
   */
  remove(): object {
    return super.remove.apply(this, arguments);
  }

  /**
   * 修改
   *
   * @returns
   */
  update(): object {
    return super.update.apply(this, arguments);
  }

  /**
   * 从查询处理返回数据
   *
   * @returns
   */
  processResponse(): object {
    // 调用基类processResponse函数
    const original: DataResult = super.processResponse.apply(this, arguments);

    // 操作提示
    if (isUndefined(original['count']) && isObject(original)) {
      const message = original['message'];

      if (original['status'] && message) {
        this._wsMessageService.toast('success', message);
      } else {
        this._wsMessageService.toast('error', message);
      }
    } else {
      if (!isUndefined(original.result)) {
        let i = 0;
        original.result.forEach(item => (item['rn'] = ++i));
      }
    }

    return original;
  }

  /**
   * 批量操作
   *
   * @returns
   */
  batchRequest(): object {
    return super.batchRequest.apply(this, arguments);
  }

  /**
   * 额外参数
   *
   * @returns
   */
  addParams(): void {
    const arg: ParamsOptions = arguments[0];

    arg.dm.dataSource.headers = [{ Authorization: `Bearer ${this._storageService.get<string>('accessToken')}` }];

    arguments[0] = arg;
    return super.addParams.apply(this, arguments);
  }
}
