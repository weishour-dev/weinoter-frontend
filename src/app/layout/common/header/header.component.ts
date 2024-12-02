import { NgTemplateOutlet } from '@angular/common';
import { Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { wsAnimations } from '@ws/animations';
import type { SafeAny } from '@ws/types';

@Component({
  selector: 'ws-header',
  templateUrl: './header.component.html',
  animations: wsAnimations,
  standalone: true,
  imports: [NgTemplateOutlet],
})
export class WsHeaderComponent {
  /** 标题 */
  @Input() title = '';

  /** 副标题 */
  @Input() subtitle = '';

  /** 操作的模板 */
  @ContentChild('iconActionTemplate', { static: true }) iconActionTemplate: TemplateRef<SafeAny>;
}
