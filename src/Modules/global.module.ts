import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from 'src/Common';
import { UserModel } from 'src/DB/Models';
import { UserRepository } from 'src/DB/Repositories';



@Global()
@Module({
  imports: [UserModel],
  providers: [UserRepository, TokenService, JwtService],
  exports: [UserModel, UserRepository, TokenService],
})
export class GlobalModule {}
