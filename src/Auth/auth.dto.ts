import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterBodyDto {
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class ConfirmEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  otp: string;
}

export class ForgetPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  otp: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
