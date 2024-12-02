import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'ws-star-bg',
  templateUrl: './star-bg.component.html',
  styleUrls: ['./star-bg.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class WsStarBgComponent {}
