import { Injectable } from '@angular/core';
import { GridProvider } from '@ws/providers';
import { WsHttpService } from '@ws/services/http';
import { Routes } from 'app/core/config';
import { BaseService } from 'app/core/services/base.service';
import { IColumnPermissionModel, Permission } from 'app/core/systems/permissions/interfaces';

@Injectable({ providedIn: 'root' })
export class PermissionsService extends BaseService<{ T: IColumnPermissionModel; K: Permission }> {
  apiPoint = Routes.systems.permissions;

  constructor(gridProvider: GridProvider, wsHttpService: WsHttpService) {
    super(gridProvider, wsHttpService);
  }
}
