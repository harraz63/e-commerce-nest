import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserType } from '../DB/Models/user.model';
import { UserRepository } from '../DB/Repositories/user.repository';
import { compareHash, encrypt, generateHash } from '../Common/Utils';
import { TokenService } from '../Common/Services/token.service';
import { customAlphabet } from 'nanoid';
import { GenderEnum, OtpEnum, ProviderEnum } from 'src/Common';
import { emitter } from 'src/Common/Utils/send-email.utils';
import {
  ConfirmEmailDto,
  ForgetPasswordDto,
  ResetPasswordDto,
} from './auth.dto';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';

const uniqueString = customAlphabet('012345679', 5);

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  // Register
  async register(body: object) {
    const {
      firstName,
      lastName,
      email,
      password,
      age,
      gender,
      phone,
    }: Partial<UserType> = body;

    const isEmailAlreadyExist = await this.userRepo.findOne({ email });
    if (isEmailAlreadyExist)
      throw new ConflictException('Email already exists');

    // Hash And Encryption For Sensitive Data
    const hashedPassword = generateHash(password!);
    const encryptedPhoneNumber = encrypt(phone!);

    // Generate OTP
    const otp = uniqueString();

    const user = await this.userRepo.createDocument({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      age,
      gender,
      phone: encryptedPhoneNumber,
      otp: {
        type: OtpEnum.VERIFY_EMAIL,
        value: generateHash(otp),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), //  10 Minutes Expiry
      },
    });

    // Send Register Email To User
    emitter.emit('sendEmail', {
      to: email,
      subject: '🔐 Verify Your Email - Your OTP Code Inside',
      content: `
<div style="font-family: Arial, sans-serif; line-height:1.6; color:#333; max-width:600px; margin:auto; padding:20px; border:1px solid #ddd; border-radius:8px; background:#fff;">
  
  <div style="text-align:center; margin-bottom:20px;">
    <h2 style="color:#ff6b6b; margin:0;">🔐 Email Verification</h2>
  </div>

  <p>Hello,</p>
  <p>Thank you for registering with our store! To complete your account setup, please verify your email address using the OTP code below:</p>

  <div style="background:#fff5f5; border:2px solid #ff6b6b; padding:20px; margin:25px 0; text-align:center; border-radius:8px;">
    <p style="margin:0 0 10px 0; font-size:14px; color:#666; text-transform:uppercase; letter-spacing:1px;">Your OTP Code</p>
    <div style="font-size:32px; font-weight:bold; letter-spacing:6px; color:#ff6b6b; font-family:monospace;">
      ${otp}
    </div>
  </div>

  <div style="background:#fffbea; border-left:4px solid #ffb84d; padding:12px 15px; margin:20px 0; border-radius:4px;">
    <p style="margin:0; font-size:14px; color:#8b6914;">
      ⚠️ This code will expire in <strong>10 minutes</strong>
    </p>
  </div>

  <p>Enter this code on the verification page to activate your account and start shopping with us.</p>

  <p style="margin-top:30px;">Best regards,<br/><strong>Your Store Team</strong> 🛍️</p>

  <hr style="margin:30px 0; border:none; border-top:1px solid #eee;"/>
  
  <p style="font-size:12px; color:#888; text-align:center; line-height:1.8;">
    You received this email because you signed up for an account.<br/>
    If you didn't request this, please ignore this email.
  </p>
</div>
  `,
    });

    const safeUser = {
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      genser: user.gender,
      isVerified: user.isVerified,
      _id: user._id,
    };

    return safeUser;
  }

  // Login
  async login(body: object) {
    const { email, password }: Partial<UserType> = body;

    // Get The User From DB
    const user = await this.userRepo.findOne({ email });
    if (!user) throw new NotFoundException('User not found');

    // Check If The Password Is Correct
    const isPasswordMatch = compareHash(password!, user.password);
    if (!isPasswordMatch)
      throw new UnauthorizedException('Invalid credentials');

    // Generate Access And Refresh Tokens
    const accessToken = this.tokenService.generateToken(
      {
        id: user._id,
        role: user.role,
        email: user.email,
      },
      {
        expiresIn: '1d',
        secret: process.env.JWT_ACCESS_SECRET as string,
        jwtid: uuidv4(),
      },
    );
    const refreshToken = this.tokenService.generateToken(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      {
        expiresIn: '30d',
        secret: process.env.JWT_REFRESH_SECRET as string,
        jwtid: uuidv4(),
      },
    );

    const safeUser = {
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      genser: user.gender,
      isVerified: user.isVerified,
      _id: user._id,
    };

    return { safeUser, tokens: { accessToken, refreshToken } };
  }

  // Confirm Email
  async confirmEmail(body: ConfirmEmailDto) {
    const { email, otp } = body;
    if (!email || !otp)
      throw new BadRequestException('Email and OTP are required');

    // Get The User Info
    const user = await this.userRepo.findUserByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    if (user.isVerified === true)
      throw new BadRequestException('Account is already verified');

    // Check About OTP Type
    if (user.otp!.type !== OtpEnum.VERIFY_EMAIL)
      throw new BadRequestException('Invalid OTP type');

    // Compare Hashes And Check Expiry Date
    const isOtpMatches = compareHash(otp, user.otp!.value);
    const isOtpExpired = user.otp!.expiresAt.getTime() < Date.now();

    if (isOtpExpired || !isOtpMatches) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Verify Account
    user.isVerified = true;
    user.otp = undefined;

    await user.save();

    return { message: 'Account verified successfully' };
  }

  // Forget Password
  async forgetPassword(body: ForgetPasswordDto) {
    const { email } = body;

    // Find The User
    const user = await this.userRepo.findUserByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    // OTP Logic
    const otp = uniqueString();
    user.otp = {
      type: OtpEnum.RESET_PASSWORD,
      value: generateHash(otp),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), //  10 Minutes Expiry
    };
    await user.save();

    // Send OTP Email
    emitter.emit('sendEmail', {
      to: email,
      subject: '🔒 Reset Your Password - Verification Code',
      content: `
<div style="font-family: Arial, sans-serif; line-height:1.6; color:#333; max-width:600px; margin:auto; padding:20px; border:1px solid #ddd; border-radius:8px; background:#fff;">
  
  <div style="text-align:center; margin-bottom:20px;">
    <h2 style="color:#e74c3c; margin:0;">🔒 Password Reset Request</h2>
  </div>

  <p>Hello,</p>
  <p>We received a request to reset the password for your account. Use the verification code below to proceed with resetting your password:</p>

  <div style="background:#fff5f5; border:2px solid #e74c3c; padding:20px; margin:25px 0; text-align:center; border-radius:8px;">
    <p style="margin:0 0 10px 0; font-size:14px; color:#666; text-transform:uppercase; letter-spacing:1px;">Verification Code</p>
    <div style="font-size:32px; font-weight:bold; letter-spacing:6px; color:#e74c3c; font-family:monospace;">
      ${otp}
    </div>
  </div>

  <div style="background:#fffbea; border-left:4px solid #ffb84d; padding:12px 15px; margin:20px 0; border-radius:4px;">
    <p style="margin:0; font-size:14px; color:#8b6914;">
      ⏱️ This code will expire in <strong>10 minutes</strong>
    </p>
  </div>

  <p>Enter this code on the password reset page to create a new password for your account.</p>

  <div style="background:#fff3cd; border:1px solid #ffc107; padding:15px; margin:25px 0; border-radius:6px;">
    <p style="margin:0; font-size:14px; color:#856404;">
      <strong>⚠️ Security Alert:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
    </p>
  </div>

  <p style="margin-top:30px;">Stay secure,<br/><strong>Your Store Team</strong> 🛍️</p>

  <hr style="margin:30px 0; border:none; border-top:1px solid #eee;"/>
  
  <p style="font-size:12px; color:#888; text-align:center; line-height:1.8;">
    This is an automated security email from your account.<br/>
    If you have concerns about your account security, please contact our support team immediately.
  </p>
</div>
  `,
    });

    return { message: 'Reset password OTP send to your email' };
  }

  // Reset Password
  async resetPassword(body: ResetPasswordDto) {
    const { email, otp, newPassword } = body;

    const user = await this.userRepo.findUserByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    // Check About OTP Type
    if (user.otp!.type !== OtpEnum.RESET_PASSWORD)
      throw new BadRequestException('Invalid OTP type');

    const isOtpMatches = compareHash(otp, user.otp!.value);
    const isOtpExpired = user.otp!.expiresAt.getTime() < Date.now();

    if (isOtpExpired || !isOtpMatches)
      throw new BadRequestException('Invalid or expired OTP');

    // Reset Password
    user.password = generateHash(newPassword);

    // Delete OTP From DB
    user.otp = undefined;
    await user.save();

    return { message: 'Password reset successfully' };
  }

  // Signup With Gmail
  async signWithGmail(body) {
    const { idToken } = body;
    if (!idToken) throw new BadRequestException('ID token is required');

    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_ID,
    });

    const { email, given_name, family_name, email_verified, sub }: any =
      ticket.getPayload();

    if (!email_verified) throw new BadRequestException('Email is not verified');

    // Creating The User Logic
    let user = await this.userRepo.findOne({
      googleSub: sub,
      provider: ProviderEnum.GOOGLE,
    });

    if (!user) {
      // Create New User
      user = await this.userRepo.createDocument({
        firstName: given_name,
        lastName: family_name || ' ',
        email,
        provider: ProviderEnum.GOOGLE,
        isVerified: true,
        password: generateHash(uniqueString()),
        age: 18,
        gender: GenderEnum.MALE,
        googleSub: sub,
      });
    } else {
      // Update Exixting User
      user.email = email;
      user.firstName = given_name;
      user.lastName = family_name;
      await user.save();
    }

    // Generate Access And Refresh Tokens
    const accessToken = this.tokenService.generateToken(
      {
        id: user._id,
        role: user.role,
        email: user.email,
      },
      {
        expiresIn: '1d',
        secret: process.env.JWT_ACCESS_SECRET as string,
        jwtid: uuidv4(),
      },
    );
    const refreshToken = this.tokenService.generateToken(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      {
        expiresIn: '30d',
        secret: process.env.JWT_REFRESH_SECRET as string,
        jwtid: uuidv4(),
      },
    );

    return { accessToken, refreshToken };
  }
  
}
