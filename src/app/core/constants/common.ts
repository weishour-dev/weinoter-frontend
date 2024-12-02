import { DevuiSelectOptions, DevuiTabOptions } from '@ws/types';

/** 权限分类数据 */
export const PermissionTypeItems: DevuiTabOptions[] = [
  {
    id: 'MENU',
    title: '菜单',
  },
  {
    id: 'UI',
    title: '页面',
  },
  {
    id: 'ACTION',
    title: '操作',
  },
];

/** 变量分类数据 */
export const VariableClassifyItems: DevuiTabOptions[] = [
  {
    id: 'status',
    title: '状态',
  },
  {
    id: 'energy',
    title: '能耗',
  },
];

/** 数据类型数据 */
export const DataTypeItems = [
  {
    id: 'float',
    name: '浮点型',
  },
  {
    id: 'int',
    name: '整型',
  },
  {
    id: 'string',
    name: '字符型',
  },
  {
    id: 'boolean',
    name: '布尔型',
  },
];

/** 浮点型格式化数据 */
export const FloatFormatItems = [
  {
    id: 0,
    name: '默认',
  },
];

/** 整型格式化数据 */
export const IntFormatItems = [
  {
    id: 0,
    name: '默认',
  },
];

/** 字符型格式化数据 */
export const StringFormatItems = [
  {
    id: 0,
    name: '默认',
  },
];

/** 布尔型格式化数据 */
export const BooleanFormatItems = [
  {
    id: 0,
    name: '开 | 关',
  },
  {
    id: 1,
    name: '启用 | 停用',
  },
];

/** 开关数据 */
export const SwitchData = [
  {
    id: 0,
    name: '关',
  },
  {
    id: 1,
    name: '开',
  },
];

/** 启用停用数据 */
export const StartData = [
  {
    id: 0,
    name: '停用',
  },
  {
    id: 1,
    name: '启用',
  },
];

/** 时间筛选模式选项 */
export const TimeFilterModes: DevuiSelectOptions[] = [
  { value: 'custom', title: '区间自定' },
  { value: 'classify', title: '区间分类' },
];

/** 授权目标对象 */
export const MandateTargets = [
  { value: 'user', name: '用户' },
  { value: 'role', name: '角色' },
  { value: 'group', name: '用户组' },
  { value: 'department', name: '部门' },
];

/** 授权目标对象类型 */
export const enum MandateTargetType {
  USER = 'user',
  ROLE = 'role',
  GROUP = 'group',
  DEPARTMENT = 'department',
}
