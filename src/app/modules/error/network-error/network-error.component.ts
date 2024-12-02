import { Component } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { WsResultComponent } from '@ws/components/result';
import { errorNetworkError } from 'app/core/config';

@Component({
  selector: 'network-error',
  template: `
    <ng-container *transloco="let t; scope: 'error'">
      <ws-result
        [src]="errorNetworkError"
        [title]="t('error.network-error')"
        actionLink="/"
        [actionText]="t('error.return_home')" />
    </ng-container>
  `,
  standalone: true,
  imports: [WsResultComponent, TranslocoModule],
})
export class NetworkErrorComponent {
  /** 路径配置 */
  errorNetworkError = errorNetworkError;
}
