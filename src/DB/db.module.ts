import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './Models/user.model';
import { UserRepository } from './Repositories/user.repository';

@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class DatabaseModule {}
