import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflactor: Reflector) {}

  canActivate(context: ExecutionContext) {
    const {
      user: { role },
    } = context.switchToHttp().getRequest().loggedInUser; // Logged User Role

    const allowedRoles = this.reflactor.get('roles', context.getHandler());

    if (allowedRoles.includes(role)) {
      return true;
    }

    throw new UnauthorizedException(
      'You are not authorized to access this resource',
    );
  }
}
