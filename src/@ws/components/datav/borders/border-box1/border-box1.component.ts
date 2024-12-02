import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewEncapsulation } from '@angular/core';
import { BorderBase } from '@ws/components/datav/border-base';

@Component({
  selector: 'dv-border-box1',
  templateUrl: './border-box1.component.html',
  styleUrls: ['./border-box1.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class BorderBox1Component extends BorderBase {
  borderBoxNum: number = 1;
  border = ['left-top', 'right-top', 'left-bottom', 'right-bottom'];

  /**
   * 构造函数
   */
  constructor(eleRef: ElementRef, cdRef: ChangeDetectorRef) {
    super(eleRef, cdRef);
  }

  get boderRadius() {
    const {
      _colors: [color0, color1],
    } = this;
    return {
      fill0: color0,
      value0: `${color0};${color1};${color0}`,
      fill1: color1,
      value1: `${color1};${color0};${color1}`,
      fill2: color0,
      value2: `${color0};${color1};transparent`,
    } as any;
  }

  get polygonPoint() {
    const { width, height } = this;
    return `10, 27 10, ${height - 27} 13, ${height - 24} 13, ${height - 21} 24, ${height - 11} 38, ${height - 11}
    41, ${height - 8} 73, ${height - 8} 75, ${height - 10} 81, ${height - 10} 85, ${height - 6}
    ${width - 85}, ${height - 6} ${width - 81}, ${height - 10} ${width - 75}, ${height - 10}
    ${width - 73}, ${height - 8} ${width - 41}, ${height - 8} ${width - 38}, ${height - 11}
    ${width - 24}, ${height - 11} ${width - 13}, ${height - 21} ${width - 13}, ${height - 24}
    ${width - 10}, ${height - 27} ${width - 10}, 27 ${width - 13}, 25 ${width - 13}, 21
    ${width - 24}, 11 ${width - 38}, 11 ${width - 41}, 8 ${width - 73}, 8 ${width - 75}, 10
    ${width - 81}, 10 ${width - 85}, 6 85, 6 81, 10 75, 10 73, 8 41, 8 38, 11 24, 11 13, 21 13, 24`;
  }
}
