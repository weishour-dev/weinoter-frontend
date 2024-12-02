import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewEncapsulation } from '@angular/core';
import { BorderBase } from '@ws/components/datav/border-base';

@Component({
  selector: 'dv-border-box6',
  templateUrl: './border-box6.component.html',
  styleUrls: ['./border-box6.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class BorderBox6Component extends BorderBase {
  borderBoxNum: number = 6;

  constructor(eleRef: ElementRef, ceRef: ChangeDetectorRef) {
    super(eleRef, ceRef);
  }
}
