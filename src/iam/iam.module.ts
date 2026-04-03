import { AccountsModule } from '@app/accounts/accounts.module';
import { AccountsGuard } from '@app/accounts/guards/accounts.guard';
import { AuthenticationController } from '@app/iam/authentication/authentication.controller';
import { AuthenticationService } from '@app/iam/authentication/authentication.service';
import { JwtAuthGuard } from '@app/iam/authentication/guards';
import { JwtStrategy, LocalStrategy } from '@app/iam/authentication/strategies';
import jwtConfig from '@app/iam/config/jwt.config';
import { REQUEST_USER_KEY } from '@app/iam/iam.constants';
import { UsersModule } from '@app/users/users.module';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    AccountsModule,
    ConfigModule.forFeature(jwtConfig),
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: REQUEST_USER_KEY,
      session: false,
    }),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    LocalStrategy,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AccountsGuard,
    },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class IamModule {}
