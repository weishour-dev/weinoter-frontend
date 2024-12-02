import { ActivatedRouteSnapshot } from '@angular/router';
import type { SafeAny } from '@ws/types';
import { Observable } from 'rxjs';

/**
 * 复用匹配模式
 */
export enum ReuseTabMatchMode {
  /**
   * （推荐）按菜单 `Menu` 配置
   *
   * 可复用：
   * - `{ text:'Dashboard' }`
   * - `{ text:'Dashboard', reuse: true }`
   *
   * 不可复用：
   * - `{ text:'Dashboard', reuse: false }`
   */
  Menu,
  /**
   * 按菜单 `Menu` 强制配置
   *
   * 可复用：
   * - `{ text:'Dashboard', reuse: true }`
   *
   * 不可复用：
   * - `{ text:'Dashboard' }`
   * - `{ text:'Dashboard', reuse: false }`
   */
  MenuForce,
  /**
   * 对所有路由有效，可以配合 `excludes` 过滤无须复用路由
   */
  URL,
}

export type ReuseTabRouteParamMatchMode = 'strict' | 'loose';

export interface ReuseTitle {
  text?: string;
  i18n?: string;
}

export interface ReuseTabCached {
  id: string | number;
  icon: string;
  title: ReuseTitle;
  url: string;
  /** 是否允许关闭，默认：`true` */
  closeable?: boolean;
  /** 当前滚动条位置 */
  position?: [number, number] | null;
  _snapshot?: ActivatedRouteSnapshot;
  _handle?: ReuseComponentHandle;
}

export interface ReuseTabNotify {
  /** 事件类型 */
  active:
    | 'add'
    | 'override'
    | 'title'
    | 'clear'
    | 'closeable'
    | 'close'
    | 'closeLeft'
    | 'closeRight'
    | 'closeOther'
    | 'move'
    | 'refresh'
    | 'loadState';
  url?: string;
  title?: ReuseTitle;
  item?: ReuseTabCached;
  list?: ReuseTabCached[];
  [key: string]: SafeAny;
}

export interface ReuseItem {
  id: string | number;
  icon: string;
  url: string;
  title: string;
  closeable: boolean;
  index: number;
  active: boolean;
  last: boolean;
  /** 当前滚动条位置 */
  position?: [number, number] | null;
}

export interface ReuseContextEvent {
  event: MouseEvent;
  item: ReuseItem;
  customContextMenu?: ReuseCustomContextMenu[];
}

export type CloseType = 'close' | 'closeOther' | 'closeRight' | 'custom' | 'refresh' | null;

export interface ReuseContextCloseEvent {
  type: CloseType;
  item: ReuseItem;
  includeNonCloseable: boolean;
}

export interface ReuseContextI18n {
  close?: string;
  closeOther?: string;
  closeRight?: string;
  refresh?: string;
}

export interface ReuseCustomContextMenu {
  id: string;
  title: string;
  fn: (item: ReuseItem, menu: ReuseCustomContextMenu) => void;
  disabled?: (item: ReuseItem) => boolean;
}

export interface ReuseComponentHandle {
  componentRef: ReuseComponentRef;
}

export interface ReuseComponentRef {
  instance: ReuseComponentInstance;
}

export type ReuseHookTypes = '_onReuseInit' | '_onReuseDestroy';

export type ReuseHookOnReuseInitType = 'init' | 'refresh';

export interface ReuseComponentInstance {
  _onReuseInit: (type: ReuseHookOnReuseInitType) => void;
  _onReuseDestroy: () => void;
  ngOnInit: () => void;
  destroy: () => void;
}

export type ReuseCanClose = (options: { item: ReuseItem; includeNonCloseable: boolean }) => Observable<boolean>;