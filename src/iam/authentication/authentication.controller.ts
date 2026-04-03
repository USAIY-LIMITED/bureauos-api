import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticationService } from './authentication.service';
import { CurrentUser, Public } from '../decorators';
import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
} from '@app/iam/authentication/dto';
import type { CurrentUserData } from '@app/iam/interfaces';
import { omit } from '@app/core/utils/functions';
import { VerifyCodeDto } from '@app/iam/authentication/dto/verify.code.dto';
import { UpdateUserProfileDto } from '@app/users/dto/update-user-profile.dto';
import { ForgotPasswordDto } from './dto/forgot.password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendVerificationCodeDto } from './dto/verification-code.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register Account',
  })
  @ApiResponse({
    status: 200,
    description: 'user created successfully',
  })
  @Post('/register')
  async register(@Body() registerDto: RegisterDto) {
    if (registerDto.dateOfBirth) {
      registerDto.dateOfBirth = new Date(registerDto.dateOfBirth).toISOString();
    }

    return await this.authService.register(registerDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send Verification Code' })
  @ApiResponse({
    status: 200,
    description: 'Verification code sent successfully',
  })
  @Post('/send-verification-code')
  async sendVerificationCode(
    @Body() sendVerificationCodeDto: SendVerificationCodeDto,
  ) {
    return await this.authService.sendVerificationCode(sendVerificationCodeDto);
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Verify Token',
  })
  @ApiResponse({
    status: 200,
    description: 'Verification successfully',
  })
  @Post('/verify')
  async verifyToken(@Body() verifyCodeDto: VerifyCodeDto) {
    return await this.authService.verifyToken(verifyCodeDto);
  }

  @Public()
  /*@UseGuards(LocalAuthGuard)*/
  @ApiOperation({
    summary: 'Login as user of any Account',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    if (loginDto.email) {
      loginDto.email = loginDto.email.toLowerCase();
    }
    return this.authService.login(loginDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Forgot Password' })
  @ApiResponse({ status: 200, description: 'Password reset link sent' })
  @Post('/forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    if (!forgotPasswordDto.email) throw new BadRequestException('Email required');
    return await this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset Password' })
  @ApiResponse({
    status: 200,
    description: 'Password has been reset successfully',
  })
  @Post('/reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Authenticated user data',
  })
  @Get('/me')
  async me(@CurrentUser() user: CurrentUserData) {
    return omit(user, ['password', 'hashedRt', 'account']);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update authenticated user data',
  })
  @Patch('/me')
  async update(
    @CurrentUser() user: CurrentUserData,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    // console.log(user)
    // console.log(updateUserProfileDto);
    return await this.authService.updateUser(user, updateUserProfileDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Change password',
  })
  @Patch('/me/change-password')
  async changePassword(
    @CurrentUser() user: CurrentUserData,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(user, changePasswordDto);
  }
}
