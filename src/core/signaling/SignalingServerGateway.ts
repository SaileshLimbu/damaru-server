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
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { WsJwtGuard } from "../guards/wsjwt.guard";
import { UseGuards } from "@nestjs/common";
import { EmulatorService } from "../../modules/emulators/services/emulator.service";
import { EmulatorStatus } from "../../modules/emulators/interfaces/emulator.status";
import { ActivityLogService } from "../../modules/activity_logs/services/activity_log.service";
import { Actions } from "../../modules/activity_logs/enums/Actions";
import { exec } from "child_process";
import { EmulatorAdmin } from "../guards/emulator_admin.guard";
import { JwtToken } from "../../modules/auth/interfaces/jwt_token";

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

  // @UseGuards(WsJwtGuard, EmulatorAdmin)
  @SubscribeMessage('StartStreaming')
  async handleStartStreaming(@ConnectedSocket() client: Socket, @MessageBody() { deviceId }: { deviceId: string }) {
    console.log('Started', { message: 'Streaming started.' });
    console.log('user', client.handshake['user'] as JwtToken )

    // const user = client.handshake['user'].sub
    this.connections.set(deviceId, client);
    // const linkedEmulatorId = await this.emulatorService.linkEmulator(
    //   { device_id: deviceId, user_id: user, account_id: null, expiry_at: null },
    //   user
    // );
    // await this.emulatorService.connectEmulator(linkedEmulatorId, user);
    // await this.emulatorService.update(deviceId, { status: EmulatorStatus.online }, user);
    console.log('Started', { message: 'Streaming started.' });
    client.emit('Started', { message: 'Streaming started.' });
    // await this.activityLogService.log({
    //   user_id: user,
    //   device_id: deviceId,
    //   action: Actions.START_STREAMING,
    //   metadata: { message: 'Streaming started.', startedBy: user, on: Date.now() }
    // });
  }

  // @UseGuards(WsJwtGuard)//AndroidAccount or AndroidAdmin too
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
    console.log('offering');
    const emulatorSocket = this.connections.get(deviceId);
    if (!emulatorSocket) {
      client.emit('Error', { message: 'Emulator not found.' });
      return;
    }
    emulatorSocket.emit('Offer', { sdp, clientId: client.id });
  }

  // @UseGuards(WsJwtGuard, EmulatorAdmin)
  @SubscribeMessage('Answer')
  async handleAnswer(@MessageBody() { clientId, sdp }: { clientId: string; sdp: string }) {
    console.log('sending answer');
    console.log({ clientId, sdp });
    if (clientId) {
       this.server.to(clientId).emit('Answer', { sdp } );
    }
  }

  // @UseGuards(WsJwtGuard, EmulatorAdmin) //EmulatorAdmin or AndroidAccount or AndroidAdmin
  @SubscribeMessage('IceCandidate')
  handleIceCandidate(@MessageBody() { clientId, iceCandidate, isEmulator }: { clientId: string, iceCandidate:RTCIceCandidate, isEmulator: boolean }) {
    console.log('ice candidate trigger', clientId, iceCandidate)
    if(!isEmulator) {
      console.log('ice candidate to server trigger', clientId, iceCandidate)
      console.log('connections', this.connections)
      const emulatorSocket = this.connections.get(clientId);
      emulatorSocket.emit('IceCandidate', { iceCandidate });
    } else {
      this.server.to(clientId).emit('IceCandidate', { iceCandidate });
    }
  }
  // @UseGuards(WsJwtGuard, EmulatorAdmin)
  @SubscribeMessage('RunCommand')
  async runAdb(@MessageBody() { adbCmd }: { adbCmd: string }) {
    console.log('RunCommand', adbCmd)
    await this.executeADBCommand(adbCmd)
  }

  executeADBCommand = (command) => {
    return new Promise((resolve, reject) => {
      exec(`${command}`, (err, stdout, stderr) => {
        if (err) {
          reject(`Error executing command: ${stderr}`);
        } else {
          resolve(stdout);
        }
      });
    });
  };
  afterInit(server: Server): any {
    // server.use((socket: Socket, next) => {
    //   try {
    //     let auth_token = socket.handshake.headers.authorization;
    //     // get the token itself without "Bearer"
    //     auth_token = auth_token.split(' ')[1];
    //     console.log({ auth_token });
    //     const json = this.jwtService.verify(auth_token);
    //     console.log(json);
    //     console.log('Auth token validated!')
    //     next();
    //   } catch (e) {
    //     console.log('on error');
    //     next(new WsException('Unauthorized'));
    //   }
    // });
  }

  handleConnection(client: Socket): any {
    console.log('Client connected', client.id);
  }

  handleDisconnect(client: Socket): any {
    console.log('Client disconnected', client.id);
  }
}
