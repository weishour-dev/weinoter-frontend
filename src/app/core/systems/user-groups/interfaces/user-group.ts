export interface UserGroup {
  id: number;
  code: string;
  name: string;
  description: string;
  status: boolean;
  sort: number;
  createdTime: string;
  updatedTime: string;
}

export interface IColumnUserGroupModel {
  rn?: number;
  id?: number;
  code?: string;
  name?: string;
  description?: string;
  status?: boolean;
  sort?: number;
  createdTime?: Date;
  updatedTime?: Date;
}
