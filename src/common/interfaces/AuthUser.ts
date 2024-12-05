import { JwtToken } from '../../modules/auth/interfaces/jwt_token';

export interface AuthUser {
  user: JwtToken;
}
