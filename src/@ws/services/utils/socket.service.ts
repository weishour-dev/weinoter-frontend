import { Injectable } from '@angular/core';
import { WsSocket } from '@ws/providers';
import { WsMessageService } from '@ws/services/message';
import { environment } from 'environments/environment';
import { Socket } from 'socket.io-client';
// import { DeviceCollectionDto } from 'app/modules/admin/monitoring/monitoring.columns';

export type DisconnectDescription =
  | Error
  | {
      description: string;
      context?: unknown;
    };

@Injectable({ providedIn: 'root' })
export class WsSocketService {
  ioSocket: Socket;
  connected: boolean;
  attemptCount = 0;

  /**
   * 构造函数
   */
  constructor(
    public wsSocket: WsSocket,
    private _wsMessageService: WsMessageService,
  ) {
    /** 连接成功事件 */
    wsSocket.on('connect', () => {
      this.ioSocket = this.wsSocket.ioSocket;
      this.connected = this.ioSocket.connected;

      // 重连处理
      if (this.attemptCount !== 0) {
        this._wsMessageService.toast('success', '远程服务重连成功');
        this.attemptCount = 0;
      }

      if (!environment.production) console.log('连接WS服务成功!', this.wsSocket);
    });

    /** 连接断开事件 */
    wsSocket.on('disconnect', (reason: Socket.DisconnectReason, details?: DisconnectDescription) => {
      this.ioSocket = this.wsSocket.ioSocket;
      this.connected = this.ioSocket.connected;

      // 断线描述
      const description = details instanceof Error ? details.message : details.description;

      switch (reason) {
        // 连接已关闭（例如：用户失去连接，或网络从 WiFi 更改为 4G）
        case 'transport close':
          this._wsMessageService.notification('warning', '远程服务中断', description);
          break;
        // 服务器已使用socket.disconnect()强制断开套接字
        case 'io server disconnect':
        // 使用socket.disconnect()手动断开套接字
        case 'io client disconnect':
        // 服务器未在该pingInterval + pingTimeout范围内发送 PING
        case 'ping timeout':
        // 连接遇到错误（例如：服务器在 HTTP 长轮询周期中被杀死）
        case 'transport error':
          this._wsMessageService.notification('warning', '远程服务断开', description);
          break;
      }
    });

    /** 发生命名空间中间件错误时触发 */
    wsSocket.on('connect_error', (error: Error) => {
      this.ioSocket = this.wsSocket.ioSocket;
      this.connected = this.ioSocket.connected;

      if (error.message === 'Invalid namespace') {
        this._wsMessageService.notification('error', '远程服务连接错误', '无效的名称空间');
      } else if (error.message === 'xhr poll error') {
        this.attemptCount++;
        this._wsMessageService.notification('warning', '远程服务连接失败', `第${this.attemptCount}次重新连接中...`);
      }
    });
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 发送获取设备总览信息
   *
   * @param deviceCollectionDto
   */
  // deviceCollection(deviceCollectionDto: DeviceCollectionDto): void {
  //   this.wsSocket.emit('device_collection', deviceCollectionDto, (result: Result) => {
  //     // if (!result.status) console.log(result);
  //   });
  // }

  /**
   * 发送获取设备状态或能耗数据 (实时)
   *
   * @param deviceCollectionDto
   */
  // deviceStatusAndEnergyLast(deviceCollectionDto: DeviceCollectionDto): void {
  //   this.wsSocket.emit('device_status_energy_last', deviceCollectionDto, (result: Result) => {
  //     // if (!result.status) console.log(result);
  //   });
  // }
}
