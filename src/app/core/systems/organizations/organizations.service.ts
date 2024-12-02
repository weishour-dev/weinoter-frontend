import { Injectable } from '@angular/core';
import { GridProvider } from '@ws/providers';
import { WsHttpService } from '@ws/services/http';
import { Routes } from 'app/core/config';
import { BaseService } from 'app/core/services/base.service';
import { Department } from 'app/core/systems/departments';
import {
  AddOrganizationDto,
  EditOrganizationDto,
  IColumnOrganizationModel,
  Organization,
} from 'app/core/systems/organizations/interfaces';

@Injectable({ providedIn: 'root' })
export class OrganizationsService extends BaseService<{
  T: IColumnOrganizationModel;
  K: Organization;
  A: AddOrganizationDto;
  E: EditOrganizationDto;
  O: Department;
}> {
  apiPoint = Routes.systems.organizations;

  constructor(gridProvider: GridProvider, wsHttpService: WsHttpService) {
    super(gridProvider, wsHttpService);
  }
}
