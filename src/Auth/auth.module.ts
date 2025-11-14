import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {TokenService } from '../Common';  
import {UserRepository } from 'src/DB/Repositories';
import { UserModel } from 'src/DB/Models/user.model';

@Module({
  imports: [UserModel],
  controllers: [AuthController],
  providers: [AuthService, TokenService, JwtService, UserRepository],
  exports: [],
})
export class AuthModule {}