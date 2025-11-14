import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Auth } from '../Common/Decorators/custom.decorator';
import { AuthUser } from '../Common/Decorators/custom.decorator';
import { RolesEnum } from '../Common/Constants/enum.constants';
import { UserType } from '../DB/Models/user.model';
import {
  ConfirmEmailDto,
  ForgetPasswordDto,
  LoginWithGmailDto,
  ResetPasswordDto,
} from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Register
  @Post('register')
  async register(@Body() body: object) {
    return await this.authService.register(body);
  }

  // Login
  @Post('login')
  @HttpCode(200)
  async login(@Body() body: object) {
    return await this.authService.login(body);
  }

  // Confirm Email
  @Post('confirm-email')
  @HttpCode(200)
  async confirmEmail(@Body() body: ConfirmEmailDto) {
    return await this.authService.confirmEmail(body);
  }

  // Forget Password
  @Post('forget-password')
  @HttpCode(200)
  async forgetPassword(@Body() body: ForgetPasswordDto) {
    return await this.authService.forgetPassword(body);
  }

  // Reset Password
  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  // Signup With Gmail
  @Post("gmail-register")
  signWithGmail(@Body() body: unknown) {
    return this.authService.signWithGmail(body)
  }

  // Login With Gmail
  @Post("gmail-login")
  @HttpCode(200)
  loginWithGmail(@Body() body) {
    return this.authService.loginWithGmail(body)
  }

}
