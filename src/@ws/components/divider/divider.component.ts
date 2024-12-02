import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { TabsModule } from 'ng-devui';

@Component({
  selector: 'ws-divider',
  templateUrl: './divider.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TabsModule],
})
export class WsDividerComponent {
  /** 类型 */
  @Input() type: 'tabs' | 'pills' | 'options' | 'wrapped' | 'slider' = 'tabs';

  /** 标题 */
  @Input() title: string;

  /** 尺寸 */
  @Input() size: 'lg' | 'md' | 'sm' | 'xs' = 'md';
}
