export interface IColumnMenuModel {
  rn?: number;
  id?: number;
  parentId?: number;
  type?: string;
  icon?: string;
  title?: string;
  translation?: string;
  link?: string;
  subtitle?: string;
  badgeTitle?: string;
  reuse?: boolean;
  reuseCloseable?: boolean;
  hidden?: boolean;
  disabled?: boolean;
  isSystem?: boolean;
  createdTime?: Date;
  updatedTime?: Date;
}

export interface MenuModel {
  id?: number;
  parentId?: number;
  type?: string;
  icon?: string;
  title?: string;
  translation?: string;
  link?: string;
  subtitle?: string;
  badgeTitle?: string;
  reuse?: boolean;
  reuseCloseable?: boolean;
  hidden?: boolean;
  disabled?: boolean;
  isSystem?: boolean;
  // children?: MenuModel[];
  hasChildren?: boolean;
  createdTime?: Date | string;
  updatedTime?: Date | string;
}
