import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { LangDefinition, TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { setCulture, setCurrencyCode } from '@syncfusion/ej2-base';
import { WsNavigationService, WsVerticalNavigationComponent } from '@ws/components/navigation';
import { WsConfigService } from '@ws/services/config';
import type { SafeAny } from '@ws/types';
import { DropDownModule } from 'ng-devui';
import { I18nService } from 'ng-devui/i18n';

@UntilDestroy()
@Component({
  selector: 'languages',
  templateUrl: './languages.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'languages',
  standalone: true,
  imports: [NgTemplateOutlet, MatButtonModule, DropDownModule],
})
export class LanguagesComponent implements OnInit {
  availableLangs: LangDefinition[];
  activeLang: string;
  flagCodes: SafeAny;

  /**
   * 构造函数
   */
  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private _changeDetectorRef: ChangeDetectorRef,
    private _wsNavigationService: WsNavigationService,
    private _wsConfigService: WsConfigService,
    private _translocoService: TranslocoService,
    private _i18nService: I18nService,
  ) {}

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    // 从transloco获取可用的语言
    this.availableLangs = this._translocoService.getAvailableLangs() as LangDefinition[];

    // 订阅语言更改
    this._translocoService.langChanges$.pipe(untilDestroyed(this)).subscribe(activeLang => {
      // 获取活动的语言
      this.activeLang = activeLang;

      let lang = this.activeLang;
      let syncfusionLang = this.activeLang;
      switch (lang) {
        case 'zh':
          lang = 'zh-CN';
          syncfusionLang = 'zh-Hans';
          setCurrencyCode('CNY');
          break;
        case 'en':
          lang = 'en-US';
          syncfusionLang = 'en-US';
          setCurrencyCode('USD');
          break;
      }

      // 设置html的lang
      this._document.documentElement.lang = lang;

      // 更新Syncfusion国际化
      setCulture(syncfusionLang);

      // 更新Devui国际化
      this._i18nService.toggleLang(lang.toLowerCase());

      // 更新导航
      // this._updateNavigation(activeLang);
    });

    // 设置国旗语言的国家iso代码
    this.flagCodes = {
      zh: 'cn',
      en: 'us',
    };
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 设置活动的语言
   *
   * @param lang
   */
  setActiveLang(lang: string): void {
    // 设置活动的语言
    this._translocoService.setActiveLang(lang);

    // 更新默认语言配置
    this._wsConfigService.config = { defaultLang: lang };
  }

  /**
   * 下拉状态
   *
   * @param event
   */
  onToggle(event: boolean): void {}

  // ----------------------------------------------------------------------------
  // @ 私有方法
  // ----------------------------------------------------------------------------

  /**
   * 更新导航
   *
   * @param lang
   * @private
   */
  private _updateNavigation(lang: string): void {
    // 获取组件->导航数据->项
    const navComponent = this._wsNavigationService.getComponent<WsVerticalNavigationComponent>('mainNavigation');

    // 如果导航组件不存在，则返回
    if (!navComponent) return;

    // 获取平面导航数据
    const navigation = navComponent.navigation;

    // 主页
    // const homeItem = this._wsNavigationService.getItem('home', navigation);
    // if (homeItem) {
    //   this._translocoService
    //     .selectTranslate('navigation.home')
    //     .pipe(take(1))
    //     .subscribe((translation) => {
    //       // 设置标题
    //       homeItem.title = translation;

    //       // 刷新导航组件
    //       navComponent.refresh();
    //     });
    // }

    // // 系统设置
    // this._translocoService
    //   .selectTranslate(this.settingsItem.translation)
    //   .pipe(take(1))
    //   .subscribe((translation: string) => (this.settingsItem.title = translation));

    // if (navComponent) setTimeout(() => navComponent.refresh());
  }
}
