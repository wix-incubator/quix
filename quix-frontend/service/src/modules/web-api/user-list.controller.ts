import {Controller, Get, Param, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {UsersService, User, UserProfile} from 'modules/auth';
import {ConfigService, EnvSettings} from 'config';
import {sanitizeUserName, sanitizeUserEmail} from 'common/user-sanitizer';

@Controller('/api/users')
@UseGuards(AuthGuard())
export class UserListController {
  private env: EnvSettings;
  constructor(
    private usersService: UsersService,
    configService: ConfigService,
  ) {
    this.env = configService.getEnvSettings();
  }

  @Get()
  async getUsers(@User() user: UserProfile) {
    if (this.env.DemoMode) {
      return (await this.usersService.getListOfUsers()).map(u => {
        return u.id === user.email
          ? u
          : {
              name: sanitizeUserName(u.name),
              id: sanitizeUserEmail(u.id),
              avatar: '',
              rootFolder: u.rootFolder,
            };
      });
    } else {
      return this.usersService.getListOfUsers();
    }
  }
}
