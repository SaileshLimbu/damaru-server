import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from '../guards/wsjwt.guard';
import { UseGuards } from '@nestjs/common';
import { EmulatorService } from '../../modules/emulators/services/emulator.service';
import { EmulatorStatus } from '../../modules/emulators/interfaces/emulator.status';
import { ActivityLogService } from '../../modules/activity_logs/services/activity_log.service';
import { Actions } from '../../modules/activity_logs/enums/Actions';

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

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('StartStreaming')
  async handleStartStreaming(@ConnectedSocket() client: Socket, @MessageBody() { deviceId }: { deviceId: string }) {
    const user = 2;
    this.connections.set(deviceId, client);
    await this.emulatorService.update(deviceId, { status: EmulatorStatus.online }, user);
    const linkedEmulatorId = await this.emulatorService.linkEmulator(
      { device_id: deviceId, user_id: user, account_id: null, expiry_at: null },
      user
    );
    await this.emulatorService.connectEmulator(linkedEmulatorId, user);
    console.log('Started', { message: 'Streaming started.' });
    client.emit('Started', { message: 'Streaming started.' });
    await this.activityLogService.log({
      user_id: user,
      device_id: deviceId,
      action: Actions.START_STREAMING,
      metadata: { message: 'Streaming started.', startedBy: user, on: Date.now() }
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('Offer')
  async handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    {
      connectionId,
      sdp
    }: {
      connectionId: string;
      sdp: string;
    }
  ) {
    console.log('offering');
    const emulatorSocket = this.connections.get(connectionId);
    if (!emulatorSocket) {
      client.emit('Error', { message: 'Emulator not found.' });
      return;
    }
    emulatorSocket.emit('Offer', { sdp, clientId: client.id });
  }

  @SubscribeMessage('Answer')
  async handleAnswer(@MessageBody() { clientId, sdp }: { clientId: string; sdp: string }) {
    console.log('sending answer');
    console.log({ clientId, sdp });
    // if (clientId) {
    this.server.to(clientId).emit('Answer', { sdp });
    // }
  }

  @SubscribeMessage('datachannelcreate')
  handleStopStreaming(@MessageBody() { connectionId }: { connectionId: string }) {
    // this.connections.delete(connectionId);
    this.server.emit('datachannelcreate', { message: 'Streaming stopped.' });
  }

  @SubscribeMessage('IceCandidate')
  handleIceCandidate(@MessageBody() { clientId, candidate }: { clientId: string, candidate:any }) {
    console.log('ice candidate trigger', clientId, candidate)
    this.server.to(clientId).emit('IceCandidate', { clientId, candidate})
  }

  afterInit(server: Server): any {
    server.use((socket: Socket, next) => {
      try {
        console.log('afterinit');

        let auth_token = socket.handshake.headers.authorization;
        // get the token itself without "Bearer"
        auth_token = auth_token.split(' ')[1];
        console.log({ auth_token });
        const json = this.jwtService.verify(auth_token);
        console.log(json);
        next();
      } catch (e) {
        console.log('on error');
        // next(new Error('some error'));
        next();
        // throw new UnauthorizedException('Not uthorized!!')
      }
    });
  }

  handleConnection(client: Socket): any {
    console.log('handleconnection', client.id);

    // try {
    //   let auth_token = client.handshake.headers.authorization;
    //   // get the token itself without "Bearer"
    //   auth_token = auth_token.split(' ')[1];
    //   console.log({ auth_token });
    //   const json = this.jwtService.verify(auth_token);
    //   console.log(json);
    // } catch (e) {
    //   client.disconnect();
    //   // throw new UnauthorizedException('Not uthorized!!')
    // }
  }

  handleDisconnect(client: Socket): any {
    console.log(client.data);
  }
}
