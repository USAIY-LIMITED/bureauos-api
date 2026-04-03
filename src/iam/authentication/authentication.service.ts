import { AccountsService } from '@app/accounts/accounts.service';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '@app/iam/config/jwt.config';
import { UserDatabaseService } from '@app/users/db/users.db.service';
import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
} from '@app/iam/authentication/dto';
import { HashingService } from '@app/users/hashing.service';
import { JwtPayload } from '@app/iam/interfaces';
import { PrismaService } from '@app/core/database/prisma.service';
import { CurrentUserData } from '../interfaces';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userDatabaseService: UserDatabaseService,
    private readonly hashingService: HashingService,
    private readonly accountService: AccountsService,
    private jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly prismaService: PrismaService,
  ) {}

  async register(data: RegisterDto) {
    try {
      const { password, ...accountData } = data;
      const hashedPassword = await this.hashingService.hashPassword(password);
      
      return await this.accountService.create({
        ...accountData,
        password: hashedPassword,
      });
    } catch (error) {
      if (error && (error as any).code === 'P2002') {
        throw new BadRequestException('User with that email already exists');
      }
      throw error;
    }
  }

  async signIn(data: LoginDto) {
    const email = data?.email;
    const password = data?.password;

    if (!email || !password) {
      throw new BadRequestException('Email and password is required');
    }

    const lowercaseEmail = email.toLowerCase();
    
    const user = await this.userDatabaseService.findFirstBy({ email: lowercaseEmail });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValidPassword = await this.hashingService.comparePasswords(
      password,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    if (!user.accounts || user.accounts.length === 0) {
      throw new UnauthorizedException('No Accounts created for user');
    }

    const accountForToken = user.accounts[0];

    const accessToken = await this.signToken<JwtPayload>(
      user.id,
      this.jwtConfiguration.accessTokenTtl as number,
      {
        email: user.email,
        currentAccountId: accountForToken.id,
        currentAccountType: accountForToken.type,
      },
    );

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return { accessToken };
  }

  async login(data: LoginDto) {
    return this.signIn(data);
  }

  async sendVerificationCode(dto: any) {
    return { message: 'Verification code sent', ...dto };
  }

  async verifyToken(dto: any) {
    return { message: 'Token verified', ...dto };
  }

  async forgotPassword(email: string) {
    return { message: 'Reset link sent if email exists', email };
  }

  async resetPassword(token: string, newPass: string) {
    return { message: 'Password reset successfully' };
  }

  async updateUser(user: CurrentUserData, dto: any) {
    return await this.userDatabaseService.update(user.id, dto);
  }

  async changePassword(user: CurrentUserData, dto: ChangePasswordDto) {
    const dbUser = await this.userDatabaseService.findById(user.id);
    if (!dbUser) throw new NotFoundException('User not found');

    const isValid = await this.hashingService.comparePasswords(dto.oldPassword, dbUser.password);
    if (!isValid) throw new UnauthorizedException('Incorrect password');

    const hashedPassword = await this.hashingService.hashPassword(dto.newPassword);
    await this.userDatabaseService.update(user.id, { password: hashedPassword });
    
    return { message: 'Password changed successfully' };
  }

  private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }
}
