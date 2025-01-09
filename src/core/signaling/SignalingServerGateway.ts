import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from '../guards/wsjwt.guard';
import { UseGuards } from '@nestjs/common';
import { EmulatorService } from '../../modules/emulators/services/emulator.service';
import { EmulatorStatus } from '../../modules/emulators/interfaces/emulator.status';
import { EmulatorAdmin } from '../guards/emulator_admin.guard';
import { AndroidUsers } from '../guards/android_user.guard';
import { EmulatorUsers } from '../guards/emulator_user.guard';

@WebSocketGateway({
  namespace: 'signaling',
  cors: {
    origin: '*'
  }
})
export class SignalingServerGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly jwtService: JwtService,
    private readonly emulatorService: EmulatorService
  ) {}

  @WebSocketServer()
  server: Server;
  private connections = new Map<string, Socket>();

  @UseGuards(WsJwtGuard, EmulatorAdmin)
  @SubscribeMessage('StartStreaming')
  async handleStartStreaming(@ConnectedSocket() client: Socket, @MessageBody() { deviceId }: { deviceId: string }) {
    console.log('Started', { message: `Streaming started: ${deviceId}` });
    if (deviceId) {
      this.connections.set(deviceId, client);
      await this.emulatorService.update(deviceId, { status: EmulatorStatus.online });
    }
  }

  @UseGuards(WsJwtGuard, AndroidUsers)
  @SubscribeMessage('Offer')
  async handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    {
      deviceId,
      sdp
    }: {
      deviceId: string;
      sdp: string;
    }
  ) {
    const emulatorSocket: Socket = this.connections.get(deviceId);
    if (!emulatorSocket) {
      throw new WsException('Emulator not found');
    }
    const accountId: string = client.handshake['user'].accountId;
    this.connections.set(accountId, client);
    const response = { sdp, clientId: accountId };
    emulatorSocket?.emit('Offer', response);
  }

  @UseGuards(WsJwtGuard, EmulatorAdmin)
  @SubscribeMessage('Answer')
  async handleAnswer(@MessageBody() { clientId, sdp }: { clientId: string; sdp: string }) {
    if (clientId) {
      this.connections.get(clientId)?.emit('Answer', { sdp });
    }
  }

  @UseGuards(WsJwtGuard, EmulatorUsers)
  @SubscribeMessage('IceCandidate')
  handleIceCandidate(
    @MessageBody()
    {
      isEmulator,
      clientId,
      deviceId,
      iceCandidate
    }: {
      isEmulator: boolean;
      clientId: string;
      deviceId: string;
      iceCandidate: RTCIceCandidate;
    }
  ) {
    const id = isEmulator ? clientId : deviceId;
    this.connections.get(id)?.emit('IceCandidate', {
      iceCandidate,
      clientId,
      deviceId,
      isEmulator
    });
  }

  @UseGuards(WsJwtGuard, EmulatorUsers)
  @SubscribeMessage('Disconnect')
  disconnect(@MessageBody() { clientId, deviceId }: { clientId: string; deviceId: string }) {
    console.log('disconnect', clientId, deviceId);
    const socket: Socket = this.connections.get(deviceId);
    socket?.emit('Disconnect', { clientId });
  }

  @UseGuards(WsJwtGuard, EmulatorUsers)
  @SubscribeMessage('Connect')
  async connect(@MessageBody() { clientId, deviceId }: { clientId: string; deviceId: string }) {
    await this.emulatorService.connectEmulator(clientId, deviceId);
  }

  afterInit(server: Server): any {
    server.use((socket: Socket, next) => {
      try {
        let auth_token = socket.handshake.headers.authorization;
        auth_token = auth_token.split(' ')[1];
        const user = this.jwtService.verify(auth_token);
        console.log(user);
        next();
      } catch (e) {
        next(new WsException('Unauthorized'));
      }
    });
  }

  handleConnection(client: Socket): any {
    console.log('Client connected', client.id);
  }

  async handleDisconnect(client: Socket) {
    this.connections.forEach((socket, clientId) => {
      if (socket.id === client.id) {
        this.emulatorService.disconnectEmulator(clientId);
      }
    });
  }
}
