import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { fade } from '@jiaminghi/color';
import { DecorationBase } from '@ws/components/datav/decoraton-base';

@Component({
  selector: 'dv-decoration11',
  templateUrl: './decoration11.component.html',
  styleUrls: ['./decoration11.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Decoration11Component extends DecorationBase {
  @Input() width = 200;
  @Input() height = 60;
  decorationNum = 11;
  defaultColor = ['#1a98fc', '#2cf7fe'];

  constructor(eleRef: ElementRef, ceRef: ChangeDetectorRef) {
    super(eleRef, ceRef);
  }

  /**
   * 调节颜色透明度
   * @param num
   */
  fade(cnum: number, dnum: number, num: number) {
    return fade(this._colors[cnum] || this.defaultColor[dnum], num);
  }
}
