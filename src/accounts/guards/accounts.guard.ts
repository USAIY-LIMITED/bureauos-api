import { ACCOUNTS_KEY } from '@app/accounts/decorators/accounts.decorator';
import { REQUEST_USER_KEY } from '@app/iam/iam.constants';
import { CurrentUserData } from '@app/iam/interfaces';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccountType } from '@prisma/client';
import { Observable } from 'rxjs';

@Injectable()
export class AccountsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const contextAccounts = this.reflector.getAllAndOverride<AccountType[]>(
      ACCOUNTS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!contextAccounts) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: CurrentUserData | undefined = request[REQUEST_USER_KEY];
    const accountType = user.account.type;
    const accountId = user.account.id;

    // Append Current User AccountID for non-admin users
    if (user.account.type !== AccountType.ADMIN) {
      request.body['accountId'] = accountId;
      request.query['accountId'] = accountId;
      
      // Ensure users can only update their own profile if not admin
      if (request.method === 'PATCH' && request.url.includes('/accounts')) {
        request.params['id'] = String(accountId);
      }
    }

    return contextAccounts.some((account) => accountType === account);
  }
}
