import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configureService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configureService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret',
      passReqToCallback: true,
    } as any);
  }

  async validate(req: Request, payload: any) {
    const authHeader = req.get('authorization');
    if (!authHeader) {
      throw new UnauthorizedException('Refresh token is missing');
    }
    const refreshToken = authHeader.replace('Bearer ', '').trim();
    return {
      ...payload,
      refreshToken,
    };
  }
}
