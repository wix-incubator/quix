import {Controller, Get, Param, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {UsersService} from 'modules/auth';
import {EnvSettings, ConfigService} from 'config';

@Controller('/api/users')
@UseGuards(AuthGuard())
export class UserListController {
  private readonly envSettings: EnvSettings;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    this.envSettings = this.configService.getEnvSettings();
  }

  @Get()
  getUsers() {
    return this.usersService.getListOfUsers(
      this.envSettings.RunMode === 'demo',
    );
  }
}
