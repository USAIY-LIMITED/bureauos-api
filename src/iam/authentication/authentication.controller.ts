import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticationService } from './authentication.service';
import { CurrentUser, Public } from '../decorators';
import { ChangePasswordDto, LoginDto, RegisterDto } from '@app/iam/authentication/dto';
import type { CurrentUserData } from '@app/iam/interfaces';
import { omit } from '@app/core/utils/functions';
import { VerifyCodeDto } from '@app/iam/authentication/dto/verify.code.dto';
import { UpdateUserProfileDto } from '@app/users/dto/update-user-profile.dto';
import { ForgotPasswordDto } from './dto/forgot.password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendVerificationCodeDto } from './dto/verification-code.dto';
import { RtGuard } from './guards/refresh-token.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register Account' })
  @Post('/register')
  async register(@Body() registerDto: RegisterDto) {
    if (registerDto.dateOfBirth) {
      registerDto.dateOfBirth = new Date(registerDto.dateOfBirth).toISOString();
    }
    return this.authService.register(registerDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login' })
  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    if (loginDto.email) loginDto.email = loginDto.email.toLowerCase();
    return this.authService.login(loginDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP verification code to email' })
  @Post('/send-verification-code')
  async sendVerificationCode(@Body() dto: SendVerificationCodeDto) {
    return this.authService.sendVerificationCode(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP code — activates the account' })
  @Post('/verify')
  async verifyToken(@Body() verifyCodeDto: VerifyCodeDto) {
    return this.authService.verifyToken(verifyCodeDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send password reset link' })
  @Post('/forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    if (!forgotPasswordDto.email) throw new BadRequestException('Email required');
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token from email' })
  @Post('/reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @Public()
  @UseGuards(RtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @Post('/refresh')
  async refresh(@CurrentUser() user: any) {
    return this.authService.refreshTokens(user.sub, user.refreshToken);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout — invalidates refresh token' })
  @Post('/logout')
  async logout(@CurrentUser() user: CurrentUserData) {
    return this.authService.logout(user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Authenticated user data' })
  @Get('/me')
  async me(@CurrentUser() user: CurrentUserData) {
    return omit(user, ['password', 'hashedRt', 'account']);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update authenticated user profile' })
  @Patch('/me')
  async update(
    @CurrentUser() user: CurrentUserData,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.authService.updateUser(user, updateUserProfileDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  @Patch('/me/change-password')
  async changePassword(
    @CurrentUser() user: CurrentUserData,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user, changePasswordDto);
  }
}
