import { Injectable } from '@angular/core';
import { JSONSchema, StorageMap } from '@ngx-pwa/local-storage';
import type { SafeAny } from '@ws/types';
import { LocalStorageService } from 'ngx-localstorage';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StorageService {
  constructor(
    public _localStorageService: LocalStorageService,
    public _storageMap: StorageMap,
  ) {}

  /**
   * 设置值
   *
   * @param key
   * @param value
   * @returns
   */
  set(key: string, value: SafeAny): void {
    this._localStorageService.set(key, value);
  }

  /**
   * 获取值
   *
   * @param key
   * @returns
   */
  get<T>(key: string): T {
    return this._localStorageService.get<T>(key);
  }

  /**
   * 删除值
   *
   * @param key
   * @returns
   */
  remove(key: string): void {
    this._localStorageService.remove(key);
  }

  /**
   * 获取值
   *
   * @param key
   * @param schema
   * @returns
   */
  async getDb<T>(key: string, schema: JSONSchema): Promise<T | undefined> {
    return await firstValueFrom(this._storageMap.get<T>(key, schema));
  }

  /**
   * 设置值
   *
   * @param key
   * @param data
   * @param schema
   * @returns
   */
  async setDb(key: string, data: unknown, schema?: JSONSchema): Promise<undefined> {
    return await firstValueFrom(this._storageMap.set(key, data, schema));
  }

  /**
   * 删除值
   *
   * @param key
   * @returns
   */
  async deleteDb(key: string): Promise<undefined> {
    return await firstValueFrom(this._storageMap.delete(key));
  }

  /**
   * 清空所有值
   *
   * @returns
   */
  async clearDb(): Promise<undefined> {
    return await firstValueFrom(this._storageMap.clear());
  }
}
