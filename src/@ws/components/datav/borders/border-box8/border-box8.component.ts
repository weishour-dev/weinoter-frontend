import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { BorderBase } from '@ws/components/datav/border-base';

let numId = 0;

@Component({
  selector: 'dv-border-box8',
  templateUrl: './border-box8.component.html',
  styleUrls: ['./border-box8.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class BorderBox8Component extends BorderBase {
  @Input() reverse = false;
  @Input() dur = 3;
  borderBoxNum: number = 8;
  path = `border-box-8-path-${numId}`;
  gradient = `border-box-8-gradient-${numId}`;
  mask = `border-box-8-mask-${numId}`;

  constructor(eleRef: ElementRef, ceRef: ChangeDetectorRef) {
    numId++;
    super(eleRef, ceRef);
  }

  get length() {
    return (this.width + this.height - 5) * 2;
  }

  pathD() {
    const { reverse, width, height } = this;
    if (reverse)
      return `M 2.5, 2.5 L 2.5, ${height - 2.5} L ${width - 2.5}, ${height - 2.5} L ${width - 2.5}, 2.5 L 2.5, 2.5`;

    return `M2.5, 2.5 L${width - 2.5}, 2.5 L${width - 2.5}, ${height - 2.5} L2.5, ${height - 2.5} L2.5, 2.5`;
  }
}
