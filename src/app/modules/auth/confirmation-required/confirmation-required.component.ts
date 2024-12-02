import { Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { wsAnimations } from '@ws/animations';

@Component({
  selector: 'auth-confirmation-required',
  templateUrl: './confirmation-required.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: wsAnimations,
  standalone: true,
  imports: [RouterLink],
})
export class AuthConfirmationRequiredComponent {}
