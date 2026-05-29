import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthenticationService } from '@app/iam/authentication/authentication.service';
import { Request } from 'express';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthenticationService) {
    super({
      usernameField: 'email',
      passReqToCallback: true,
    });
  }

  async validate(request: Request): Promise<any> {
    const { email, password } = request.body;
    const userOrTokens = await this.authService.login({ email, password } as any);

    if (!userOrTokens) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    return userOrTokens;
  }
}
