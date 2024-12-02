import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { DecorationBase } from '@ws/components/datav/decoraton-base';

@Component({
  selector: 'dv-decoration2',
  templateUrl: './decoration2.component.html',
  styleUrls: ['./decoration2.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Decoration2Component extends DecorationBase {
  @Input() reverse = false;
  @Input() dur = 6;
  decorationNum = 2;
  defaultColor = ['var(--ws-primary)', '#fff'];
  x = 0;
  y = 0;
  w = 0;
  h = 0;

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
    const { reverse, width, height } = this;

    if (reverse) {
      this.w = 1;
      this.h = height;
      this.x = width / 2;
      this.y = 0;
    } else {
      this.w = width;
      this.h = 1;
      this.x = 0;
      this.y = height / 2;
    }
  }

  override onResize() {
    this.calcSVGData();
  }
}
