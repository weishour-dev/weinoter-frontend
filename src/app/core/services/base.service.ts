import { Injectable } from '@angular/core';
import { DataStateChangeEventArgs, Sorts } from '@syncfusion/ej2-angular-grids';
import { DataManager } from '@syncfusion/ej2-data';
import { Result, ResultGrid } from '@ws/interfaces';
import { GridProvider } from '@ws/providers';
import { WsHttpService } from '@ws/services/http';
import { BaseBatchAddDto, BaseDeleteDto, BaseEnableDisableDto, BaseSortDto } from 'app/core/services/dtos';
import { Observable, map } from 'rxjs';
export type SafeType = unknown;

@Injectable({ providedIn: 'root' })
export class BaseService<
  paramType extends {
    T?: object;
    K?: SafeType;
    A?: SafeType;
    B?: SafeType;
    E?: SafeType;
    O?: SafeType;
  } = {
    T: object;
    K: SafeType;
    A: SafeType;
    B: SafeType;
    E: SafeType;
    O: SafeType;
  },
  varType extends { data: SafeType; batchAdd: SafeType } = {
    data: [paramType['O'], SafeType] extends [SafeType, paramType['O']] ? paramType['K'] : paramType['O'];
    batchAdd: [paramType['B'], SafeType] extends [SafeType, paramType['B']] ? BaseBatchAddDto : paramType['B'];
  },
> {
  apiPoint: string;

  constructor(
    public gridProvider: GridProvider,
    public wsHttpService: WsHttpService,
  ) {}

  /**
   * 获取数据
   *
   * @param state
   * @returns Observable<ResultGrid<paramType['K'][]>>
   */
  getData(state?: DataStateChangeEventArgs): Observable<ResultGrid<paramType['K'][]>> {
    const params = { ...state };

    if (state && (state.sorted || []).length) {
      params['orderby'] = state.sorted
        .map((obj: Sorts) => (obj.direction === 'descending' ? `${obj.name} desc` : `${obj.name} asc`))
        .reverse()
        .join(',');
    }

    return this.wsHttpService.post<Result>(`${this.apiPoint}/grid`, params, { toast: false }).pipe(
      map((resp: Result) => {
        // 数据格式化处理
        const result = this.gridProvider.formatColumn<paramType['T']>(resp.data);

        return <ResultGrid>{
          result,
          count: resp.data.length,
          dataManager: this.gridProvider.getDataManager(this.apiPoint, result),
        };
      }),
    );
  }

  /**
   * 获取DataManager
   *
   * @param data
   * @returns DataManager
   */
  getDataManager<T>(data: T[]): DataManager {
    // 数据格式化处理
    const result = this.gridProvider.formatColumn<T>(data);

    return this.gridProvider.getDataManager(this.apiPoint, <object[]>(<unknown>result));
  }

  /**
   * 批量新增
   *
   * @param param
   * @returns Observable<string>
   */
  batchAdd(param: varType['batchAdd']): Observable<string> {
    return this.wsHttpService
      .post<Result<string>>(`${this.apiPoint}/grid/batch/add`, param)
      .pipe(map(result => result.message));
  }

  /**
   * 新增
   *
   * @param param
   * @returns Observable<varType['data']>
   */
  add(param: paramType['A']): Observable<varType['data']> {
    return this.wsHttpService
      .post<Result<varType['data']>>(`${this.apiPoint}/add`, param)
      .pipe(map(result => result.data));
  }

  /**
   * 修改
   *
   * @param param
   * @param toast
   * @returns Observable<varType['data']>
   */
  edit(param: paramType['E'], toast = true): Observable<varType['data']> {
    return this.wsHttpService
      .post<Result<varType['data']>>(`${this.apiPoint}/edit`, param, {
        toast,
      })
      .pipe(map(result => result.data));
  }

  /**
   * 删除
   *
   * @param param
   * @returns Observable<varType['data']>
   */
  remove(param: BaseDeleteDto): Observable<varType['data']> {
    return this.wsHttpService
      .post<Result<varType['data']>>(`${this.apiPoint}/remove`, param)
      .pipe(map(result => result.data));
  }

  /**
   * 显示/隐藏数据
   *
   * @param ids
   * @param hidden
   * @returns Observable<string>
   */
  showOrHidden(ids: Array<number | string>, hidden: boolean): Observable<string> {
    const action = hidden ? 'show' : 'hidden';
    return this.wsHttpService
      .post<Result<string>>(`${this.apiPoint}/${action}`, { ids })
      .pipe(map(result => result.message));
  }

  /**
   * 启用|禁用数据
   *
   * @param param
   * @returns Observable<string>
   */
  enableOrDisable(param: BaseEnableDisableDto): Observable<string> {
    const action = param.status ? 'enable' : 'disable';
    return this.wsHttpService
      .post<Result<string>>(`${this.apiPoint}/${action}`, param)
      .pipe(map(result => result.message));
  }

  /**
   * 数据排序
   *
   * @param param
   * @returns Observable<string>
   */
  sort(param: BaseSortDto): Observable<string> {
    return this.wsHttpService.post<Result<string>>(`${this.apiPoint}/sort`, param).pipe(map(result => result.message));
  }
}
