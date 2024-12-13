import { CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { JwtToken } from "../../modules/auth/interfaces/jwt_token";
import { Roles } from "../../modules/users/enums/roles";
import { WsException } from "@nestjs/websockets";

export abstract class BaseAuthorizationGuard implements CanActivate {
  protected constructor(
    private readonly role: string,
    private readonly subRole?: string
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const type = context.getType(); // Determine the type of context
    let request: any;

    if (type === 'http') {
      // HTTP Request Context
      request = context.switchToHttp().getRequest<Request>();
    } else if (type === 'ws') {
      // WebSocket Context
      const client = context.switchToWs().getClient();
      request = client.handshake; // Use the handshake object for headers
      console.log('request======', request)
    } else {
      throw new UnauthorizedException('Unsupported context type');
    }

    // Assuming `request.user` contains the JWT payload
    const jwtPayload = request.user as JwtToken;
    if (!jwtPayload) {
      throw new UnauthorizedException('Authorization failed');
    }

    console.log('Checking Authorization for payload:', jwtPayload);
    const isAuthorized = jwtPayload.role == Roles.SuperAdmin.toString() || (jwtPayload.role === this.role && jwtPayload.subRole == this.subRole);
    if(isAuthorized) {
      return true;
    } else {
      const msg = 'You are not authorized';
      if(type === 'http') {
        throw new UnauthorizedException(msg)
      } else if(type === 'ws'){
        throw new WsException(msg)
      }
    }
  }
}
