import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewEncapsulation } from '@angular/core';
import { DecorationBase } from '@ws/components/datav/decoraton-base';

@Component({
  selector: 'dv-decoration10',
  templateUrl: './decoration10.component.html',
  styleUrls: ['./decoration10.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Decoration10Component extends DecorationBase {
  decorationNum = 10;
  defaultColor = ['#00c2ff', 'rgba(0, 194, 255, 0.3)'];

  constructor(eleRef: ElementRef, ceRef: ChangeDetectorRef) {
    super(eleRef, ceRef);
  }
}
