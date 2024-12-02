import { Injectable } from '@angular/core';
import { GetParam, Result } from '@ws/interfaces';
import { GridProvider } from '@ws/providers';
import { WsHttpService } from '@ws/services/http';
import { Routes } from 'app/core/config';
import { BaseService } from 'app/core/services/base.service';
import {
  AddDepartmentDto,
  Department,
  EditDepartmentDto,
  IColumnDepartmentModel,
} from 'app/core/systems/departments/interfaces';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DepartmentsService extends BaseService<{
  T: IColumnDepartmentModel;
  K: Department;
  A: AddDepartmentDto;
  E: EditDepartmentDto;
}> {
  apiPoint = Routes.systems.departments;

  constructor(gridProvider: GridProvider, wsHttpService: WsHttpService) {
    super(gridProvider, wsHttpService);
  }

  /**
   * 获取所有组织数据
   */
  getAll(param: GetParam): Observable<Department[]> {
    return this.wsHttpService
      .get<Result<Department[]>>(this.apiPoint, param, { toast: false })
      .pipe(map(result => result.data));
  }

  /**
   * 获取所有组织数据（树状）
   */
  getAllTree(): Observable<Department[]> {
    return this.wsHttpService
      .get<Result<Department[]>>(`${this.apiPoint}/tree`, {}, { toast: false })
      .pipe(map(result => result.data));
  }

  /**
   * 获取上级部门列表
   */
  parent(): Observable<Department[]> {
    return this.wsHttpService
      .get<Result<Department[]>>(`${this.apiPoint}/parent`, {}, { toast: false })
      .pipe(map(result => result.data));
  }
}
