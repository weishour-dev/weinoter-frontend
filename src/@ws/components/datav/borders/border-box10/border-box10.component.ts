import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewEncapsulation } from '@angular/core';
import { BorderBase } from '@ws/components/datav/border-base';

@Component({
  selector: 'dv-border-box10',
  templateUrl: './border-box10.component.html',
  styleUrls: ['./border-box10.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class BorderBox10Component extends BorderBase {
  borderBoxNum: number = 10;
  border = ['left-top', 'right-top', 'left-bottom', 'right-bottom'];

  constructor(eleRef: ElementRef, ceRef: ChangeDetectorRef) {
    super(eleRef, ceRef);
  }
}
