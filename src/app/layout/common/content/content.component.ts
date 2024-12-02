import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WsReuseTabComponent } from '@ws/components/reuse-tab';

@Component({
  selector: 'contents',
  templateUrl: './content.component.html',
  styles: [
    `
      contents {
        @apply flex flex-auto flex-col;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [RouterOutlet, WsReuseTabComponent],
})
export class ContentComponent {}
