export interface Department {
  id: number;
  organizationCode?: string;
  parentId?: number;
  code: string;
  name: string;
  leaderUserIds: number[];
  membersCount: number;
  description: string;
  status: boolean;
  sort: number;
  level: number;
  selected?: boolean;
  expanded?: boolean;
  hasChildren?: boolean;
  siblingCount?: number;
  createdTime: string;
  updatedTime: string;
}

export interface IColumnDepartmentModel {
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
