import { Injectable } from '@angular/core';
import { Result } from '@ws/interfaces';
import { GridProvider } from '@ws/providers';
import { WsHttpService } from '@ws/services/http';
import { Routes } from 'app/core/config';
import { BaseService } from 'app/core/services/base.service';
import { AllotMandateDto, IColumnMandateModel, MandateModel } from 'app/core/systems/mandates/interfaces';
import { Permission } from 'app/core/systems/permissions';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MandatesService extends BaseService<{ T: IColumnMandateModel; K: MandateModel }> {
  apiPoint = Routes.systems.mandates;

  constructor(gridProvider: GridProvider, wsHttpService: WsHttpService) {
    super(gridProvider, wsHttpService);
  }

  /**
   * 获取目标对象权限列表
   *
   * @param allotMandateDto
   * @returns
   */
  permissions(allotMandateDto: AllotMandateDto): Observable<Permission[]> {
    return this.wsHttpService
      .post<Result<Permission[]>>(`${this.apiPoint}/permissions`, allotMandateDto, { toast: false })
      .pipe(map(result => result.data));
  }

  /**
   * 分配授权
   *
   * @param allotMandateDto
   * @returns
   */
  allot(allotMandateDto: AllotMandateDto): Observable<string> {
    return this.wsHttpService
      .post<Result<string>>(`${this.apiPoint}/allot`, allotMandateDto)
      .pipe(map(result => result.message));
  }
}
