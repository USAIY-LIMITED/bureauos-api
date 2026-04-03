import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { REQUEST_USER_KEY } from '@app/iam/iam.constants';
import { CurrentUserData } from '@app/iam/interfaces/current-user.interface';

export const CurrentUser = createParamDecorator(
  (field: keyof CurrentUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: CurrentUserData | undefined = request[REQUEST_USER_KEY];
    return field ? user?.[field] : user;
  },
);
