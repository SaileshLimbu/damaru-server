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
import { ActivityLogService } from '../../modules/activity_logs/services/activity_log.service';
import { Actions } from '../../modules/activity_logs/enums/Actions';
import { EmulatorAdmin } from '../guards/emulator_admin.guard';
import { JwtToken } from '../../modules/auth/interfaces/jwt_token';
import { AndroidUsers } from '../guards/android_user.guard';
import { EmulatorUsers } from '../guards/emulator_user.guard';
import { Roles } from '../../modules/users/enums/roles';

@WebSocketGateway({
  namespace: 'signaling',
  cors: {
    origin: '*'
  }
})
export class SignalingServerGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly jwtService: JwtService,
    private readonly emulatorService: EmulatorService,
    private readonly activityLogService: ActivityLogService
  ) {}

  @WebSocketServer()
  server: Server;
  private connections = new Map<string, Socket>();
  private connectedUsers = { superAdmins: [], emulatorAdmins: [], androidUsers: [] };
  private readonly ROOM_SUPER_ADMIN = 'SuperAdmins';

  @UseGuards(WsJwtGuard, EmulatorAdmin)
  @SubscribeMessage('StartStreaming')
  async handleStartStreaming(@ConnectedSocket() client: Socket, @MessageBody() { deviceId }: { deviceId: string }) {
    console.log('Started', { message: `Streaming started: ${deviceId}` });
    console.log('user', client.handshake['user'] as JwtToken);
    const user = client.handshake['user'].sub;
    this.connections.set(deviceId, client);
    console.log('Started', { message: `Streaming started. for ${deviceId}` });
    if (deviceId) {
      await this.emulatorService.update(deviceId, { status: EmulatorStatus.online }, user);
      await this.activityLogService.log({
        user_id: user,
        device_id: deviceId,
        action: Actions.START_STREAMING,
        metadata: { message: 'Streaming started.', startedBy: user, on: Date.now() }
      });
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
    console.log(`Offering started: ${deviceId}`);
    const emulatorSocket = this.connections.get(deviceId);
    if (!emulatorSocket) {
      client.emit('Error', { message: 'Emulator not found.' });
      return;
    }
    const accountId = client.handshake['user'].accountId;
    this.connections.set(accountId.toString(), client);
    const response = { sdp, clientId: accountId.toString() };
    emulatorSocket.emit('Offer', response);
  }

  @UseGuards(WsJwtGuard, EmulatorAdmin)
  @SubscribeMessage('Answer')
  async handleAnswer(@MessageBody() { clientId, sdp }: { clientId: string; sdp: string }) {
    console.log('sending answer');
    if (clientId) {
      this.connections.get(clientId).emit('Answer', { sdp });
    }
  }

  @UseGuards(WsJwtGuard, EmulatorUsers)
  @SubscribeMessage('IceCandidate')
  handleIceCandidate(
    @MessageBody() { clientId, deviceId, iceCandidate }: { clientId: string; deviceId: string, iceCandidate: RTCIceCandidate}
  ) {
    console.log('ice candidate trigger', clientId, deviceId);
    console.log({ iceCandidate });
    let emulatorSocket;
    if(clientId) {
      emulatorSocket= this.connections.get(clientId);
    } else {
      emulatorSocket = this.connections.get(deviceId);
    }
    if(emulatorSocket) {
      emulatorSocket.emit('IceCandidate', { iceCandidate });
    }
  }

  // @UseGuards(WsJwtGuard, EmulatorUsers)
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
        // get the token itself without "Bearer"
        auth_token = auth_token.split(' ')[1];
        console.log({ auth_token });
        const json: JwtToken = this.jwtService.verify(auth_token);
        console.log(json);
        console.log('Auth token validated!');
        if (json.role === Roles.SuperAdmin.toString()) {
          socket.join(this.ROOM_SUPER_ADMIN);
          this.connectedUsers.superAdmins.push({ email: json.email, userId: json.sub, clientId: socket.id });
        } else if (json.role === Roles.EmulatorAdmin.toString()) {
          this.connectedUsers.emulatorAdmins.push({ email: json.email, userId: json.sub, clientId: socket.id });
        } else {
          this.connectedUsers.androidUsers.push({
            email: json.email,
            userId: json.sub,
            clientId: socket.id,
            accountId: json.accountId,
            accountName: json.accountName
          });
        }
        next();
      } catch (e) {
        console.log('on error');
        next(new WsException('Unauthorized'));
      }
    });
  }

  handleConnection(client: Socket): any {
    this.server.to(this.ROOM_SUPER_ADMIN).emit('OnlineUsers', this.connectedUsers);
    console.log('Client connected', client.id);
  }

  handleDisconnect(client: Socket): any {
    this.connectedUsers.androidUsers = this.connectedUsers.androidUsers.filter((user) => user.clientId !== client.id);
    this.connectedUsers.superAdmins = this.connectedUsers.superAdmins.filter((user) => user.clientId !== client.id);
    this.connectedUsers.emulatorAdmins = this.connectedUsers.emulatorAdmins.filter((user) => user.clientId !== client.id);
    console.log('Client disconnected', client.id);
  }
}
