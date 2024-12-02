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
  selector: 'dv-border-box5',
  templateUrl: './border-box5.component.html',
  styleUrls: ['./border-box5.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class BorderBox5Component extends BorderBase {
  @Input() reverse = false;
  borderBoxNum: number = 5;

  constructor(eleRef: ElementRef, ceRef: ChangeDetectorRef) {
    super(eleRef, ceRef);
  }
}
