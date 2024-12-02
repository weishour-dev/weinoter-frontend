import { NgClass } from '@angular/common';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { WsConfirmationConfig } from '@ws/services/confirmation';

@Component({
  selector: 'ws-confirmation-dialog',
  templateUrl: './dialog.component.html',
  styles: [
    `
      .ws-confirmation-dialog-panel {
        @screen md {
          @apply w-128;
        }

        .mat-mdc-dialog-container {
          .mat-mdc-dialog-surface {
            padding: 0 !important;
          }
        }
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [NgClass, MatIconModule, MatButtonModule, MatDialogModule],
})
export class WsConfirmationDialogComponent {
  /**
   * 构造函数
   */
  constructor(@Inject(MAT_DIALOG_DATA) public data: WsConfirmationConfig) {}
}
