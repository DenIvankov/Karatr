import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

type RefreshJwtPayload = {
  sub: number;
  email: string;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
    });
  }

  async validate(req: Request, payload: RefreshJwtPayload) {
    const authHeader = req.get('authorization');

    const refreshToken = authHeader?.replace('Bearer', '').trim();

    return {
      userId: payload.sub,
      email: payload.email,
      refreshToken,
    };
  }
}
