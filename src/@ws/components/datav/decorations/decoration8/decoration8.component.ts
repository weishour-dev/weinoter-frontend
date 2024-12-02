import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { DecorationBase } from '@ws/components/datav/decoraton-base';

@Component({
  selector: 'dv-decoration8',
  templateUrl: './decoration8.component.html',
  styleUrls: ['./decoration8.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Decoration8Component extends DecorationBase {
  @Input() reverse = false;
  @Input() width = 300;
  @Input() height = 50;
  decorationNum = 8;
  defaultColor = ['#3f96a5', '#3f96a5'];

  constructor(eleRef: ElementRef, ceRef: ChangeDetectorRef) {
    super(eleRef, ceRef);
  }

  xPos(pos: number) {
    return !this.reverse ? pos : this.width - pos;
  }
}
