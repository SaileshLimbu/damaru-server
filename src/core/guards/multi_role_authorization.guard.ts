import { UnauthorizedException } from '@nestjs/common';
import { JwtToken } from '../../modules/auth/interfaces/jwt_token';
import { Roles } from '../../modules/users/enums/roles';
import { WsException } from '@nestjs/websockets';
import { BaseAuthorizationGuard } from './base_authorization.guard';

export abstract class MultiRoleGuard extends BaseAuthorizationGuard {
  protected constructor(private readonly rolePair: Array<{ role: string; subRole?: string }>) {
    super(null);
  }

  authorized(type: string, jwtPayload: JwtToken): boolean {
    const isAuthorized =
      jwtPayload.role == Roles.SuperAdmin.toString() ||
      this.rolePair.some((rolePair) => jwtPayload.role === rolePair.role && jwtPayload.subRole === rolePair.subRole);
    if (isAuthorized) {
      return true;
    } else {
      const msg = `You are not authorized`;
      if (type === 'http') {
        throw new UnauthorizedException(msg);
      } else if (type === 'ws') {
        throw new WsException(msg);
      }
    }
  }
}
