import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewEncapsulation } from '@angular/core';
import { BorderBase } from '@ws/components/datav/border-base';

@Component({
  selector: 'dv-border-box7',
  templateUrl: './border-box7.component.html',
  styleUrls: ['./border-box7.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  host: {
    '[style]': '_getBoxShadowStyle()',
  },
})
export class BorderBox7Component extends BorderBase {
  borderBoxNum: number = 7;

  constructor(eleRef: ElementRef, ceRef: ChangeDetectorRef) {
    super(eleRef, ceRef);
  }

  _getBoxShadowStyle() {
    return `box-shadow: inset 0 0 40px ${this._colors[0]}; border: 1px solid ${this._colors[0]}; background-color: ${this.backgroundColor}`;
  }
}
