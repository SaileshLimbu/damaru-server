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
  private clientToSocket = new Map<string, string>();

  @UseGuards(WsJwtGuard, EmulatorAdmin)
  @SubscribeMessage('StartStreaming')
  async handleStartStreaming(@ConnectedSocket() client: Socket, @MessageBody() { deviceId }: { deviceId: string }) {
    console.log('Started', { message: `Streaming started: ${deviceId}` });
    if (deviceId) {
      this.clientToSocket.set(deviceId, client.id);
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
    const emulatorSocket: Socket = this.server.sockets.sockets.get(this.clientToSocket.get(deviceId));
    if (!emulatorSocket) {
      throw new WsException('Emulator not found');
    }
    const accountId: string = client.handshake['user'].accountId;
    this.clientToSocket.set(accountId, client.id);
    const response = { sdp, clientId: accountId };
    emulatorSocket.emit('Offer', response);
  }

  @UseGuards(WsJwtGuard, EmulatorAdmin)
  @SubscribeMessage('Answer')
  async handleAnswer(@MessageBody() { clientId, sdp }: { clientId: string; sdp: string }) {
    if (clientId) {
      await this.emulatorService.connectEmulator(clientId);
      this.server.sockets.sockets.get(this.clientToSocket.get(clientId)).emit('Answer', { sdp });
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
    this.server.sockets.sockets.get(this.clientToSocket.get(id)).emit('IceCandidate', {
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
    const socket = this.connections.get(deviceId);
    socket.emit('Disconnect', { clientId });
  }

  afterInit(server: Server): any {
    server.use((socket: Socket, next) => {
      try {
        let auth_token = socket.handshake.headers.authorization;
        auth_token = auth_token.split(' ')[1];
        this.jwtService.verify(auth_token);
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
    this.clientToSocket.forEach((value, key) => {
      if (value === client.id) {
        this.emulatorService.disconnectEmulator(key);
      }
    });
  }
}
