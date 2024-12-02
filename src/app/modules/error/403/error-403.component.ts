import { Component } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { WsResultComponent } from '@ws/components/result';
import { error403 } from 'app/core/config';

@Component({
  selector: 'error-403',
  template: `
    <ng-container *transloco="let t; scope: 'error'">
      <ws-result [src]="error403" [title]="t('error.403')" actionLink="/" [actionText]="t('error.return_home')" />
    </ng-container>
  `,
  standalone: true,
  imports: [WsResultComponent, TranslocoModule],
})
export class Error403Component {
  /** 路径配置 */
  error403 = error403;
}
