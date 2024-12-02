import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewEncapsulation } from '@angular/core';
import { DecorationBase } from '@ws/components/datav/decoraton-base';

@Component({
  selector: 'dv-decoration5',
  templateUrl: './decoration5.component.html',
  styleUrls: ['./decoration5.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Decoration5Component extends DecorationBase {
  decorationNum = 5;
  defaultColor = ['#3f96a5', '#3f96a5'];
  line1Points = '';
  line2Points = '';

  /**
   * 构造函数
   */
  constructor(eleRef: ElementRef, ceRef: ChangeDetectorRef) {
    super(eleRef, ceRef);
  }

  afterAutoResizeMixinInit() {
    this.calcSVGData();
  }

  calcSVGData() {
    const { width, height } = this;

    const line1Points = [
      [0, height * 0.2],
      [width * 0.18, height * 0.2],
      [width * 0.2, height * 0.4],
      [width * 0.25, height * 0.4],
      [width * 0.27, height * 0.6],
      [width * 0.72, height * 0.6],
      [width * 0.75, height * 0.4],
      [width * 0.8, height * 0.4],
      [width * 0.82, height * 0.2],
      [width, height * 0.2],
    ];

    const line2Points = [
      [width * 0.3, height * 0.8],
      [width * 0.7, height * 0.8],
    ];

    this.line1Points = line1Points.map(point => point.join(',')).join(' ');
    this.line2Points = line2Points.map(point => point.join(',')).join(' ');
  }

  override onResize() {
    this.calcSVGData();
  }
}
