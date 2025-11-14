import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/Common/Guards/auth.guard';
import { RolesGuard } from 'src/Common/Guards/roles.guard';

export const AuthUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    return req.loggedInUser.user;
  },
);

export const Roles = (roles: string[]) => SetMetadata('roles', roles);

export function Auth(roles: string[]) {
  return applyDecorators(UseGuards(AuthGuard, RolesGuard), Roles(roles));
}
