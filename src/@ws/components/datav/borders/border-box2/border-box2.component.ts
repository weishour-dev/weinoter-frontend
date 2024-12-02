import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewEncapsulation } from '@angular/core';
import { BorderBase } from '@ws/components/datav/border-base';

@Component({
  selector: 'dv-border-box2',
  templateUrl: './border-box2.component.html',
  styleUrls: ['./border-box2.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
})
export class BorderBox2Component extends BorderBase {
  borderBoxNum = 2;

  /**
   * 构造函数
   */
  constructor(eleRef: ElementRef, cdRef: ChangeDetectorRef) {
    super(eleRef, cdRef);
  }

  get polylineInfo() {
    this.cdRef.markForCheck();
    const { width, height } = this;
    return {
      line0: `7, 7 ${width - 7}, 7 ${width - 7}, ${height - 7} 7, ${height - 7}`,
      line1: `2, 2 ${width - 2} ,2 ${width - 2}, ${height - 2} 2, ${height - 2} 2, 2`,
      line2: `6, 6 ${width - 6}, 6 ${width - 6}, ${height - 6} 6, ${height - 6} 6, 6`,
    };
  }
}
