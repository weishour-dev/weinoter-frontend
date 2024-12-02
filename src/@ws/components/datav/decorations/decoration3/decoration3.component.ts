import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewEncapsulation } from '@angular/core';
import { removeClass } from '@syncfusion/ej2-base';
import { DecorationBase } from '@ws/components/datav/decoraton-base';

@Component({
  selector: 'dv-decoration3',
  templateUrl: './decoration3.component.html',
  styleUrls: ['./decoration3.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Decoration3Component extends DecorationBase {
  private _elementRef: ElementRef;

  decorationNum = 3;
  defaultColor = ['var(--ws-primary-300)', 'transparent'];
  svgWH = [300, 35];
  svgScale = [1, 1];
  rowNum = 2;
  rowPoints = 25;
  pointSideLength = 7;
  halfPointSideLength = this.pointSideLength / 2;
  points: number[][] = [];

  /**
   * 构造函数
   */
  constructor(eleRef: ElementRef, ceRef: ChangeDetectorRef) {
    super(eleRef, ceRef);
    this._elementRef = eleRef;
  }

  afterAutoResizeMixinInit() {
    this.calcSVGData();
  }

  calcSVGData() {
    this.calcPointsPosition();
    this.calcScale();
  }

  calcPointsPosition() {
    const { svgWH, rowNum, rowPoints } = this;

    const [w, h] = svgWH;

    const horizontalGap = w / (rowPoints + 1);
    const verticalGap = h / (rowNum + 1);

    const points = new Array(rowNum)
      .fill(0)
      .map((foo, i) =>
        new Array(rowPoints)
          .fill(0)
          .map((foo, j) => [horizontalGap * (j + 1), verticalGap * (i + 1), Math.random(), Math.random()]),
      );

    this.points = points.reduce((all, item) => [...all, ...item], []);
  }

  calcScale() {
    const { width, height, svgWH } = this;
    const [w, h] = svgWH;
    this.svgScale = [width / w, height / h];
  }

  override onResize() {
    this.calcSVGData();

    if (this._elementRef?.nativeElement) removeClass([this._elementRef.nativeElement], 'w-full');
  }
}
