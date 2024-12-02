export interface RoleModel {
  id: number;
  code: string;
  name: string;
  description: string;
  status: boolean;
  sort: number;
  createdTime: string;
  updatedTime: string;
}

export interface IColumnRoleModel {
  rn?: number;
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  status?: boolean;
  sort?: number;
  createdTime?: Date;
  updatedTime?: Date;
}
