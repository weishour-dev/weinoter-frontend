import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewEncapsulation } from '@angular/core';
import { removeClass } from '@syncfusion/ej2-base';
import { DecorationBase } from '@ws/components/datav/decoraton-base';

@Component({
  selector: 'dv-decoration1',
  templateUrl: './decoration1.component.html',
  styleUrls: ['./decoration1.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Decoration1Component extends DecorationBase {
  private _elementRef: ElementRef;

  decorationNum = 1;
  defaultColor = ['#fff', 'var(--ws-primary)'];
  svgWH = [100, 30];
  svgScale = [1, 1];
  rowNum = 4;
  rowPoints = 20;
  pointSideLength = 2.5;
  halfPointSideLength = this.pointSideLength / 2;
  points: number[][] = [];
  rects: number[][] = [];

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
    this.calcRectsPosition();
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
          .map((foo, j) => [
            horizontalGap * (j + 1),
            verticalGap * (i + 1),
            Math.random(),
            Math.random(),
            Math.random(),
          ]),
      );

    this.points = points.reduce((all, item) => [...all, ...item], []);
  }

  calcRectsPosition() {
    const { points, rowPoints } = this;

    const rect1 = points[rowPoints * 2 - 1];
    const rect2 = points[rowPoints * 2 - 3];

    this.rects = [rect1, rect2];
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
