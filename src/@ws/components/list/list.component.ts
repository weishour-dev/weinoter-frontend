import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import type { SafeAny } from '@ws/types';
import { AccordionMenuType, AccordionModule } from 'ng-devui';

@Component({
  selector: 'ws-list',
  templateUrl: './list.component.html',
  styles: [
    `
      ws-list {
        d-accordion {
          d-accordion-list {
            border-radius: 0 !important;
            & ul {
              padding: 0 !important;
              /* li {
                border-bottom: 1px solid var(--devui-dividing-line);
              } */
            }
          }
        }
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [AccordionModule],
})
export class WsListComponent {
  /** 数据源 */
  @Input() data: SafeAny[] | AccordionMenuType;

  /** 子项切换更改后发出的事件 */
  @Output() readonly activeItemChange: EventEmitter<SafeAny> = new EventEmitter<SafeAny>();

  /**
   * 子项切换更改后发出的事件
   *
   * @param event
   * @returns
   */
  devuiActiveItemChange = (event: EventEmitter<SafeAny>) => this.activeItemChange.next(event);
}
