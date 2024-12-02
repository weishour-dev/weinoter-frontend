import { Component } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { WsResultComponent } from '@ws/components/result';
import { error500 } from 'app/core/config';

@Component({
  selector: 'error-500',
  template: `
    <ng-container *transloco="let t; scope: 'error'">
      <ws-result [src]="error500" [title]="t('error.500')" actionLink="/" [actionText]="t('error.return_home')" />
    </ng-container>
  `,
  standalone: true,
  imports: [WsResultComponent, TranslocoModule],
})
export class Error500Component {
  /** 路径配置 */
  error500 = error500;
}
