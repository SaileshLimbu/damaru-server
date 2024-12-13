import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class WSJwtStrategy extends PassportStrategy(Strategy, 'ws-jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: (req) => {
        console.log('request jwt', req?.handshake?.headers?.authorization)
        if (req?.handshake?.headers && req?.handshake?.headers?.authorization) {
          const authHeader = req?.handshake?.headers?.authorization as string;
          if (authHeader.startsWith('Bearer ')) {
            return authHeader.split(' ')[1]; // Extract the token
          }
        }
        throw new UnauthorizedException('Authorization header missing or malformed');
      },
      secretOrKey: configService.get<string>('SECRET'),
    });
  }

  validate(payload: any, done: (error: any, user: any) => void) {
    // Attach the decoded payload (user) to the client handshake
    if (!payload) {
      return done(new UnauthorizedException('Invalid token'), null);
    }
    done(null, payload); // Pass the payload as the user
  }
}
