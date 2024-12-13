import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from "@nestjs/websockets";

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const authHeader = client.handshake?.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization token missing or malformed');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('SECRET'),
      });
      client.handshake.user = payload; // Attach the decoded user to the handshake
      console.log('Authenticated user:', payload);
      return true;
    } catch (error) {
      throw new WsException('Invalid or expired token');
    }
  }
}
