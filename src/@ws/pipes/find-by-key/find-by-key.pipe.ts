import { Pipe, PipeTransform } from '@angular/core';
import type { SafeAny } from '@ws/types';

/**
 * 使用给定的键值对从给定源查找一个对象
 */
@Pipe({
  name: 'wsFindByKey',
  pure: false,
  standalone: true,
})
export class WsFindByKeyPipe implements PipeTransform {
  /**
   * 转换
   *
   * @param value 从源中查找的字符串或字符串数​​组
   * @param key 要查找的对象属性的键
   * @param source 要从中查找的对象数组
   */
  transform(value: string | string[], key: string, source: SafeAny[]): SafeAny {
    // 如果给定的值是一个字符串数组…
    if (Array.isArray(value)) {
      return value.map(item => source.find(sourceItem => sourceItem[key] === item));
    }

    // 如果值是字符串…
    return source.find(sourceItem => sourceItem[key] === value);
  }
}
