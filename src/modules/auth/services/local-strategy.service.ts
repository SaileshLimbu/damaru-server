import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { JwtToken } from "../interfaces/jwt_token";
import { AuthService } from "./auth.service";
import { LoginDto } from "../dtos/login.dto";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(loginDto: LoginDto): Promise<JwtToken> {
    console.log({ loginDto });
    return (await this.authService.validateUser(loginDto)).jwtPayload;
  }
}
