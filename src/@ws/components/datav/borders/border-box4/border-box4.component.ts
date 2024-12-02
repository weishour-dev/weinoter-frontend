import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { BorderBase } from '@ws/components/datav/border-base';

@Component({
  selector: 'dv-border-box4',
  templateUrl: './border-box4.component.html',
  styleUrls: ['./border-box4.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class BorderBox4Component extends BorderBase {
  @Input() reverse = false;
  borderBoxNum: number = 4;

  constructor(eleRef: ElementRef, ceRef: ChangeDetectorRef) {
    super(eleRef, ceRef);
  }
}
