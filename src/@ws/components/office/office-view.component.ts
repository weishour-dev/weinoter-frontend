import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { WsOfficeComponent } from '@ws/components/office/office.component';
import { OfficeViewData } from '@ws/components/office/office.types';
import { environment } from 'environments/environment';

@Component({
  selector: 'ws-office-view',
  template: `<ws-office
    #wsoffice
    id="wsoffice"
    [documentServerUrl]="officeApi"
    [type]="data.type"
    [documentType]="data.documentType"
    [config]="data.config" />`,
  standalone: true,
  imports: [WsOfficeComponent],
})
export class WsOfficeViewComponent implements AfterViewInit {
  @Input() data: OfficeViewData;

  /** 文档实体 */
  @ViewChild('wsoffice') wsoffice: WsOfficeComponent;

  /** 文档服务器地址 */
  officeApi: string;

  /**
   * 构造函数
   */
  constructor() {
    this.officeApi = environment.OFFICE_API;
  }

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 视图初始化后
   */
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.wsoffice.ngOnDestroy();
      this.wsoffice.onLoad();
    }, 200);
  }
}
