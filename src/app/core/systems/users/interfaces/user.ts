import { RoleModel } from 'app/core/systems/roles';
import { UserGroup } from 'app/core/systems/user-groups';

export interface User {
  id: number;
  username: string;
  nickname?: string;
  email: string;
  rememberMe: boolean;
  avatar?: string;
  departmentIds?: string[];
  about?: string;
  status?: string;
  accessToken: string;
  refreshToken: string;
  lastTime?: string;
  isSystem: boolean;
  roles?: RoleModel[];
  userGroups?: UserGroup[];
}

export interface IColumnUserModel {
  rn?: number;
  id?: number;
  avatar?: string;
  username?: string;
  nickname?: string;
  email?: string;
  password?: string;
  about?: string;
  isSystem?: boolean;
  createdTime?: Date;
  updatedTime?: Date;
}
