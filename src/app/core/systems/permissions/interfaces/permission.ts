export interface Permission {
  id: number;
  menuId: number;
  type: string;
  code: string;
  name: string;
  description: string;
  status: boolean;
  sort: number;
  createdTime: string;
  updatedTime: string;
  checked?: boolean;
}

export interface IColumnPermissionModel {
  rn?: number;
  id?: string;
  menuId?: number;
  type?: string;
  code?: string;
  name?: string;
  description?: string;
  status?: boolean;
  sort?: number;
  createdTime?: Date;
  updatedTime?: Date;
}

export interface Permissions {
  type: string;
  checked: boolean;
  indeterminate: boolean;
  name: string;
  items: Permission[];
}

export interface GroupPermissions {
  id: number;
  icon: string;
  title: string;
  hidden: boolean;
  permissions: Permissions[];
}
