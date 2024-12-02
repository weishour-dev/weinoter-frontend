import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NavigationService } from 'app/core/navigation';

@Injectable({ providedIn: 'root' })
export class TitleService {
  private _prefix: string = '';
  private _suffix: string = this._title.getTitle();
  private _separator: string = ' - ';

  readonly DELAY_TIME = 25;

  constructor(
    private _title: Title,
    private _router: Router,
    private _navigationService: NavigationService,
  ) {}

  // ----------------------------------------------------------------------------
  // @ 访问器
  // ----------------------------------------------------------------------------

  /** 设置分隔符 */
  set separator(value: string) {
    this._separator = value;
  }

  /** 设置前缀 */
  set prefix(value: string) {
    this._prefix = value;
  }

  /** 设置后缀 */
  set suffix(value: string) {
    this._suffix = value;
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 设置标题
   *
   * @param title
   */
  setTitle(title?: string | string[]): void {
    setTimeout(() => {
      const navigation = this._navigationService.activatedNavigation(this._router.url);
      this._setTitle(navigation?.title || '');
    }, this.DELAY_TIME);
  }

  // ----------------------------------------------------------------------------
  // @ 私有方法
  // ----------------------------------------------------------------------------

  /**
   * 设置标题
   *
   * @param title
   */
  private _setTitle(title?: string | string[]): void {
    if (title && !Array.isArray(title)) {
      title = [title];
    }

    const newTitles: string[] = [];

    if (this._prefix) {
      newTitles.push(this._prefix);
    }

    newTitles.push(...(<string[]>title));

    if (this._suffix) {
      newTitles.push(this._suffix);
    }

    this._title.setTitle(newTitles.join(this._separator));
  }
}
