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
  selector: 'dv-decoration4',
  templateUrl: './decoration4.component.html',
  styleUrls: ['./decoration4.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Decoration4Component extends DecorationBase {
  @Input() reverse = false;
  @Input() dur = 3;
  decorationNum = 4;
  defaultColor = ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.3)'];

  /**
   * 构造函数
   */
  constructor(eleRef: ElementRef, ceRef: ChangeDetectorRef) {
    super(eleRef, ceRef);
  }
}
