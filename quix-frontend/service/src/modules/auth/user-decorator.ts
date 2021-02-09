import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import {Request} from 'express';
import {LoginService} from './login.service';
import {AuthOptions, AuthTypes, IExternalUser} from './types';
export const User = createParamDecorator((data, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().user;
});

const getTokenFromRequestByCookie = (cookieName: string) => (req: Request) =>
  req.cookies[cookieName];
@Injectable()
export class AuthGuard implements CanActivate {
  private getTokenFromRequest: (req: Request) => string;

  constructor(
    @Inject(AuthOptions) authOptions: AuthOptions,
    private loginService: LoginService,
  ) {
    if (authOptions.type === AuthTypes.CUSTOM) {
      this.getTokenFromRequest = authOptions.auth.getTokenFromRequest;
    } else {
      this.getTokenFromRequest = getTokenFromRequestByCookie(
        authOptions.cookieName,
      );
    }
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.getTokenFromRequest(request);
    return Promise.resolve(this.loginService.verify(token)).then(user => {
      request.user = user;
      return !!user;
    });
  }
}
declare module 'express' {
  interface Request {
    user?: IExternalUser;
  }
}
