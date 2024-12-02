import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { HotToastRef } from '@ngneat/hot-toast';
import { NotificationDataType } from '@ws/interfaces';

@Component({
  selector: 'ws-notification',
  templateUrl: './notification.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class WsNotificationComponent implements OnInit {
  /** 标题 */
  title: string;
  /** 内容 */
  content: string;

  constructor(@Inject(HotToastRef) public toastRef: HotToastRef<NotificationDataType>) {}

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  ngOnInit(): void {
    const data = this.toastRef.data;

    this.title = data.title;
    this.content = data.content;
  }
}
