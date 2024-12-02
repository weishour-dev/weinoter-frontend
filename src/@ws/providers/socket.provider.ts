import { Injectable } from '@angular/core';
import { Socket } from '@ws/services/socket.io';
import { AuthService } from 'app/core/auth';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class WsSocket extends Socket {
  constructor(authService: AuthService) {
    super({
      url: environment.SOCKET_API,
      options: {
        transports: ['websocket'],
        query: { Authorization: authService.accessToken },
      },
    });
  }
}
