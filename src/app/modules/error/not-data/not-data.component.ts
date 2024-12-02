import { Component } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { WsResultComponent } from '@ws/components/result';
import { errorNotData } from 'app/core/config';

@Component({
  selector: 'not-data',
  template: `
    <ng-container *transloco="let t; scope: 'error'">
      <ws-result
        [src]="errorNotData"
        [title]="t('error.not-data')"
        actionLink="/"
        [actionText]="t('error.return_home')" />
    </ng-container>
  `,
  standalone: true,
  imports: [WsResultComponent, TranslocoModule],
})
export class NotDataComponent {
  /** 路径配置 */
  errorNotData = errorNotData;
}
