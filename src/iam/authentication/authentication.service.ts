import * as crypto from 'crypto';
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
import { AccountsService } from '@app/accounts/accounts.service';
import { EmailManagementsService } from '@app/email-managements/email-managements.service';
import { AuditLogsService } from '@app/core/audit-logs/audit-logs.service';
import { VerifyCodeDto } from './dto/verify.code.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userDatabaseService: UserDatabaseService,
    private readonly hashingService: HashingService,
    private readonly accountService: AccountsService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly prismaService: PrismaService,
    private readonly mailService: EmailManagementsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async register(data: RegisterDto) {
    const { password, ...accountData } = data;

    const result = await this.accountService.create({
      ...accountData,
      password,
      isActivated: false,
    });

    this.auditLogsService
      .log({
        action: 'REGISTER',
        entity: 'User',
        details: { email: data.email, accountType: (data as any).accountType },
      })
      .catch(() => {});

    return result;
  }

  async login(data: LoginDto) {
    const { email, password } = data;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.userDatabaseService.findFirstBy({
      email: email.toLowerCase(),
    });

    if (!user) throw new NotFoundException('User not found');

    const isValidPassword = await this.hashingService.comparePasswords(
      password,
      user.password,
    );
    if (!isValidPassword)
      throw new UnauthorizedException('Invalid credentials');

    if (!user.accounts?.length) {
      throw new UnauthorizedException('No account found for this user');
    }

    if (!user.isActivated) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    const account = user.accounts[0];
    const tokens = await this.generateTokens(
      user.id,
      account.id,
      account.type,
      user.email,
    );

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    this.auditLogsService
      .log({
        userId: user.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: String(user.id),
      })
      .catch(() => {});

    return tokens;
  }

  async sendVerificationCode(dto: { email: string }) {
    const user = await this.userDatabaseService.findFirstBy({
      email: dto.email.toLowerCase(),
    });

    if (user?.accounts?.length) {
      const accountId = user.accounts[0].id;
      const code = crypto.randomInt(100000, 999999).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await this.prismaService.verificationCode.updateMany({
        where: { accountId, userId: user.id, type: 'OTP', completed: false },
        data: { completed: true },
      });

      await this.prismaService.verificationCode.create({
        data: { code, accountId, userId: user.id, type: 'OTP', expiresAt },
      });

      await this.mailService
        .sendMail(dto.email, 'email-verification', {
          firstName: user.firstName,
          code,
        })
        .catch(() => {});
    }

    return { message: 'Verification code sent if account exists' };
  }

  async verifyToken(dto: VerifyCodeDto) {
    const user = await this.userDatabaseService.findFirstBy({
      email: dto.email.toLowerCase(),
    });

    if (!user?.accounts?.length) throw new BadRequestException('Invalid code');

    const accountId = user.accounts[0].id;
    const record = await this.prismaService.verificationCode.findFirst({
      where: {
        code: dto.code,
        accountId,
        userId: user.id,
        type: 'OTP',
        completed: false,
      },
    });

    if (!record) throw new BadRequestException('Invalid or expired code');
    if (record.expiresAt && record.expiresAt < new Date()) {
      throw new BadRequestException('Verification code has expired');
    }

    await this.prismaService.$transaction([
      this.prismaService.verificationCode.update({
        where: { id: record.id },
        data: { completed: true },
      }),
      this.prismaService.user.update({
        where: { id: user.id },
        data: { isActivated: true },
      }),
    ]);

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.userDatabaseService.findFirstBy({
      email: email.toLowerCase(),
    });

    if (user?.accounts?.length) {
      const accountId = user.accounts[0].id;
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await this.prismaService.verificationCode.updateMany({
        where: {
          accountId,
          userId: user.id,
          type: 'PASSWORD_RESET',
          completed: false,
        },
        data: { completed: true },
      });

      await this.prismaService.verificationCode.create({
        data: {
          code: token,
          accountId,
          userId: user.id,
          type: 'PASSWORD_RESET',
          expiresAt,
        },
      });

      const resetUrl = `${process.env.DASHBOARD_URL || 'http://localhost:3001'}/reset-password?token=${token}`;

      await this.mailService
        .sendMail(email, 'password-reset', {
          firstName: user.firstName,
          resetUrl,
        })
        .catch(() => {});
    }

    return { message: 'If that email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const record = await this.prismaService.verificationCode.findFirst({
      where: { code: token, type: 'PASSWORD_RESET', completed: false },
    });

    if (!record)
      throw new BadRequestException('Invalid or expired reset token');
    if (record.expiresAt && record.expiresAt < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    if (!record.userId)
      throw new BadRequestException('Invalid or expired reset token');

    const userId = record.userId;
    const hashedPassword = await this.hashingService.hashPassword(newPassword);

    await this.prismaService.$transaction([
      this.prismaService.verificationCode.update({
        where: { id: record.id },
        data: { completed: true },
      }),
      this.prismaService.user.update({
        where: { id: userId },
        data: { password: hashedPassword, hashedRt: null },
      }),
    ]);

    this.auditLogsService
      .log({
        userId,
        action: 'PASSWORD_RESET',
        entity: 'User',
        entityId: String(userId),
      })
      .catch(() => {});

    return { message: 'Password reset successfully' };
  }

  async refreshTokens(userId: number, rawRefreshToken: string) {
    const user = await this.userDatabaseService.findById(userId);
    if (!user || !(user as any).hashedRt) {
      throw new UnauthorizedException('Access denied');
    }

    const matches = await this.hashingService.comparePasswords(
      rawRefreshToken,
      (user as any).hashedRt,
    );
    if (!matches) throw new UnauthorizedException('Access denied');

    const userWithAccounts = await this.userDatabaseService.findFirstBy({
      id: userId,
    } as any);
    if (!userWithAccounts?.accounts?.length) {
      throw new UnauthorizedException('No accounts found');
    }

    const account = userWithAccounts.accounts[0];
    return this.generateTokens(
      userId,
      account.id,
      account.type,
      userWithAccounts.email,
    );
  }

  async logout(userId: number) {
    await this.userDatabaseService.update(userId, { hashedRt: null });
    return { message: 'Logged out successfully' };
  }

  async updateUser(user: CurrentUserData, dto: any) {
    return this.userDatabaseService.update(user.id, dto);
  }

  async changePassword(user: CurrentUserData, dto: ChangePasswordDto) {
    const dbUser = await this.userDatabaseService.findById(user.id);
    if (!dbUser) throw new NotFoundException('User not found');

    const isValid = await this.hashingService.comparePasswords(
      dto.oldPassword,
      dbUser.password,
    );
    if (!isValid) throw new UnauthorizedException('Incorrect current password');

    const hashedPassword = await this.hashingService.hashPassword(
      dto.newPassword,
    );
    await this.userDatabaseService.update(user.id, {
      password: hashedPassword,
      hashedRt: null,
    });

    this.auditLogsService
      .log({
        userId: user.id,
        action: 'PASSWORD_CHANGED',
        entity: 'User',
        entityId: String(user.id),
      })
      .catch(() => {});

    return { message: 'Password changed successfully' };
  }

  private async generateTokens(
    userId: number,
    accountId: number,
    accountType: string,
    email: string,
  ) {
    const payload: JwtPayload = {
      email,
      currentAccountId: accountId,
      currentAccountType: accountType,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.signToken(userId, this.jwtConfiguration.accessTokenTtl, payload),
      this.signToken(
        userId,
        this.jwtConfiguration.refreshTokenTtl,
        {},
        this.jwtConfiguration.refreshSecret,
      ),
    ]);

    const hashedRt = await this.hashingService.hashPassword(refreshToken);
    await this.userDatabaseService.update(userId, { hashedRt });

    return { accessToken, refreshToken };
  }

  private async signToken<T>(
    userId: number,
    expiresIn: number,
    payload?: T,
    secret?: string,
  ) {
    return this.jwtService.signAsync(
      { sub: userId, ...payload },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: secret ?? this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }
}
