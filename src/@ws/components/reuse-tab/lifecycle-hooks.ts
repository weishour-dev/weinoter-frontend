import { ReuseHookOnReuseInitType } from './reuse-tab.interfaces';

/**
 * 当前路由处于复用过程中时触发，“type”的值为:
 *
 * - `init` 当路由复用时
 * - `refresh` 当通过标签刷新时
 */
export interface OnReuseInit {
  _onReuseInit(type?: ReuseHookOnReuseInitType): void;
}

/**
 * 当前路由允许复用并离开路由时触发
 */
export interface OnReuseDestroy {
  _onReuseDestroy(): void;
}

// import { OnReuseInit, ReuseHookOnReuseInitType } from '@ws/components/reuse-tab';
// 路由复用进入
// _onReuseInit(type: ReuseHookOnReuseInitType) {
//   switch (type) {
//     case 'refresh':
//       break;
//   }
// }
