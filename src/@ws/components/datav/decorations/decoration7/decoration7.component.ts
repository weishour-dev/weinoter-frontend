import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewEncapsulation } from '@angular/core';
import { DecorationBase } from '@ws/components/datav/decoraton-base';

@Component({
  selector: 'dv-decoration7',
  templateUrl: './decoration7.component.html',
  styleUrls: ['./decoration7.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Decoration7Component extends DecorationBase {
  decorationNum = 7;
  defaultColor = ['#1dc1f5', '#1dc1f5'];

  /**
   * 构造函数
   */
  constructor(eleRef: ElementRef, ceRef: ChangeDetectorRef) {
    super(eleRef, ceRef);
  }
}
