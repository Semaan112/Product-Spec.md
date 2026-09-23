import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userRole = request.headers['x-user-role'];
    const userId = request.headers['x-user-id'];

    if (!userId) {
      throw new UnauthorizedException('A user identity is required to perform this action.');
    }

    // Authorization Rule: AGENT allowed, anything else denied
    if (userRole !== 'AGENT') {
      throw new ForbiddenException('Only users with AGENT role are authorized to perform this action.');
    }

    return true;
  }
}