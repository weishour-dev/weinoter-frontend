import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { fade } from '@jiaminghi/color';
import { BorderBase } from '@ws/components/datav/border-base';

const numId = 0;

@Component({
  selector: 'dv-border-box12',
  templateUrl: './border-box12.component.html',
  styleUrls: ['./border-box12.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class BorderBox12Component extends BorderBase {
  @Input() reverse = false;
  borderBoxNum: number = 12;
  filterId = `borderr-box-12-filterId-${numId}`;

  /**
   * 构造函数
   */
  constructor(eleRef: ElementRef, ceRef: ChangeDetectorRef) {
    super(eleRef, ceRef);
  }

  /**
   * 调节颜色透明度
   * @param num
   */
  fade(num: number) {
    return fade(this._colors[1] || this.defaultColor[1], num);
  }
}
