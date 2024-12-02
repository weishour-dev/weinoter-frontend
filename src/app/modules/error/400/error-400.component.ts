import { Component } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { WsResultComponent } from '@ws/components/result';
import { error400 } from 'app/core/config';

@Component({
  selector: 'error-400',
  template: `
    <ng-container *transloco="let t; scope: 'error'">
      <ws-result [src]="error400" [title]="t('error.400')" actionLink="/" [actionText]="t('error.return_home')" />
    </ng-container>
  `,
  standalone: true,
  imports: [WsResultComponent, TranslocoModule],
})
export class Error400Component {
  /** 路径配置 */
  error400 = error400;
}
