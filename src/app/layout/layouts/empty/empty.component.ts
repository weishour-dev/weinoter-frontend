import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WsLoadingBarComponent } from '@ws/components/loading-bar';

@Component({
  selector: 'empty-layout',
  templateUrl: './empty.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [RouterOutlet, WsLoadingBarComponent],
})
export class EmptyLayoutComponent {}
