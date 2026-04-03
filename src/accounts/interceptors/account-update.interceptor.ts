import { AccountDatabaseService } from '@app/accounts/accounts.db.service';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class AccountUpdateInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly accountDbService: AccountDatabaseService,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    const accountId = request.params.id;

    if (accountId) {
      this.accountDbService.findById(+accountId).then((account) => {
        request.body.accountType = account.type;
      });
    } else {
      request.body.accountType = request.user;
    }

    return next.handle();
  }
}
