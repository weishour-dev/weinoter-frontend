import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewEncapsulation } from '@angular/core';
import { DecorationBase } from '@ws/components/datav/decoraton-base';

@Component({
  selector: 'dv-decoration6',
  templateUrl: './decoration6.component.html',
  styleUrls: ['./decoration6.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Decoration6Component extends DecorationBase {
  decorationNum = 6;
  defaultColor = ['#7acaec', '#7acaec'];
  svgWH = [300, 35];
  svgScale = [1, 1];
  rowNum = 1;
  rowPoints = 40;
  rectWidth = 7;
  halfRectWidth = this.rectWidth / 2;
  points: number[][] = [];
  heights: number[] = [];
  minHeights: number[] = [];
  randoms: number[] = [];

  constructor(eleRef: ElementRef, ceRef: ChangeDetectorRef) {
    super(eleRef, ceRef);
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
      .map((_, i) =>
        new Array(rowPoints)
          .fill(0)
          .map((_, j) => [horizontalGap * (j + 1), verticalGap * (i + 1), Math.random(), Math.random()]),
      );

    this.points = points.reduce((all, item) => [...all, ...item], []);
    const heights = (this.heights = new Array(rowNum * rowPoints)
      .fill(0)
      .map(_ => (Math.random() > 0.8 ? this.randomExtend(0.7 * h, h) : this.randomExtend(0.2 * h, 0.5 * h))));

    this.minHeights = new Array(rowNum * rowPoints).fill(0).map((_, i) => heights[i] * Math.random());

    this.randoms = new Array(rowNum * rowPoints).fill(0).map(_ => Math.random() + 1.5);
  }

  calcScale() {
    const { width, height, svgWH } = this;

    const [w, h] = svgWH;

    this.svgScale = [width / w, height / h];
  }

  override onResize() {
    this.calcSVGData();
  }
}
