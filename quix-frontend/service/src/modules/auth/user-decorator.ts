import {createParamDecorator, ExecutionContext} from '@nestjs/common';

export const User = createParamDecorator((data, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().user;
});
