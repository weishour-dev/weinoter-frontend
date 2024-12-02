import { DevuiTabOptions } from '@ws/types';

/** 权限分类数据 */
export const PermissionsTypeItems: DevuiTabOptions[] = [
  {
    id: 'group',
    title: '目录',
  },
  {
    id: 'collapsable',
    title: '分组',
  },
  {
    id: 'basic',
    title: '菜单',
  },
  {
    id: 'divider',
    title: '分割线',
    disabled: true,
  },
];
