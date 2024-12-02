import { KeyValue } from '@angular/common';
import { Injectable } from '@angular/core';
import { IsActiveMatchOptions } from '@angular/router';
import type { SafeAny } from '@ws/types';
import { range, sample, without } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class WsUtilsService {
  // ----------------------------------------------------------------------------
  // @ 访问器
  // ----------------------------------------------------------------------------

  /**
   * 为"exact = true"获取等价的"IsActiveMatchOptions"选项。
   */
  get exactMatchOptions(): IsActiveMatchOptions {
    return {
      paths: 'exact',
      fragment: 'ignored',
      matrixParams: 'ignored',
      queryParams: 'exact',
    };
  }

  /**
   * 为"exact = false"获取等价的"IsActiveMatchOptions"选项。
   */
  get subsetMatchOptions(): IsActiveMatchOptions {
    return {
      paths: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored',
      queryParams: 'subset',
    };
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 生成一个随机id
   *
   * @param length
   */
  randomId(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let name = '';

    for (let i = 0; i < 10; i++) {
      name += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return name;
  }

  /**
   * 指定范围生成一个随机数并排除
   * @param start
   * @param end
   * @param exclude
   */
  randomExclude(start: number, end: number, exclude: number[]): number {
    const numbers = range(start, end);
    const filteredNumbers = without(numbers, ...exclude);
    return sample(filteredNumbers);
  }

  /**
   * 搜索字符串
   *
   * @param value
   * @param searchText
   * @returns
   */
  searchInString(value: string, searchText: string): boolean {
    return value.toLowerCase().includes(searchText);
  }

  /**
   * 通过函数跟踪ngFor循环
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: SafeAny): SafeAny {
    return item.id || index;
  }

  trackByRoute<T extends { route: string | string[] }>(index: number, item: T): string | string[] {
    return item.route;
  }

  trackById<T extends { id: string | number }>(index: number, item: T): string | number {
    return item.id;
  }

  trackByKey(index: number, item: KeyValue<SafeAny, SafeAny>): SafeAny {
    return item.key;
  }

  trackByValue(index: number, value: string): string {
    return value;
  }

  trackByLabel<T extends { label: string }>(index: number, value: T): string {
    return value.label;
  }

  /**
   * 是否实现接口
   *
   * @param data
   * @param prop
   */
  isProps<T>(data: SafeAny, prop: string): data is T {
    return typeof (<T>data)[prop] !== 'undefined';
  }
}
