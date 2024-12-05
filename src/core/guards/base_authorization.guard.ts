import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtToken } from '../../modules/auth/interfaces/jwt_token';
import { Roles } from '../../modules/users/enums/roles';

export abstract class BaseAuthorizationGuard implements CanActivate {
  protected constructor(
    private readonly role: string,
    private readonly subRole?: string
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const jwtPayload = request.user as JwtToken;
    console.log('Checking Authorization for payload', jwtPayload);
    return jwtPayload.role == Roles.SuperAdmin.toString() || (jwtPayload.role === this.role && jwtPayload.subRole == this.subRole);
  }
}
