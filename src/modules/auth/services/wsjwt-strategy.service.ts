import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtToken } from '../interfaces/jwt_token';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WSJwtStrategy extends PassportStrategy(Strategy, 'ws-jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromUrlQueryParameter('bearerToken'),
      secretOrKey: configService.get<string>('SECRET')
    });
  }

  validate(payload: JwtToken) {
    console.log('validated', payload)
    return payload;
  }
}
