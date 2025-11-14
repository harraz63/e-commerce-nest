import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { TokenService } from '../Services/token.service';
import { UserRepository } from 'src/DB/Repositories';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userRepo: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers['authorization'];

    if (!authorization) throw new BadRequestException('Please login');

    const verifiedData = this.tokenService.verifyToken(
      authorization,
      { secret: process.env.JWT_ACCESS_SECRET as string, },
    );

    

    const user = await this.userRepo.findOne({ _id: verifiedData.id });
    if (!user) throw new BadRequestException('Please signup');
    request.loggedInUser = { user, verifiedData };

    return true;
  }
}
