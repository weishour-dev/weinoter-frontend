import { Component } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { WsResultComponent } from '@ws/components/result';
import { error404 } from 'app/core/config';

@Component({
  selector: 'error-404',
  template: `
    <ng-container *transloco="let t; scope: 'error'">
      <ws-result [src]="error404" [title]="t('error.404')" actionLink="/" [actionText]="t('error.return_home')" />
    </ng-container>
  `,
  standalone: true,
  imports: [WsResultComponent, TranslocoModule],
})
export class Error404Component {
  /** 路径配置 */
  error404 = error404;
}
