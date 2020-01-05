import {Controller, Get, Param, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {UsersService, User, IGoogleUser} from 'modules/auth';
import {ConfigService, EnvSettings} from 'config';
import {sanitizeUserName, sanitizeUserEmail} from 'common/user-sanitizer';
import {IHistory} from '@wix/quix-shared';

@Controller('/api/history')
@UseGuards(AuthGuard())
export class HistoryListController {
  private env: EnvSettings;
  constructor(
    private historyService: HistoryService,
    configService: ConfigService,
  ) {
    this.env = configService.getEnvSettings();
  }

  //TODO: Fix History -> Histories
  @Get()
  async getHistory(@History() history: IHistory) {
    if (this.env.DemoMode) {
      return (await this.usersService.getListOfUsers()).map(u => {
        return u.id === user.email
          ? u
          : {
              name: sanitizeUserName(u.name),
              id: sanitizeUserEmail(u.id),
              email: sanitizeUserEmail(u.email),
              avatar: 'http://quix.wix.com/assets/user.svg',
              rootFolder: u.rootFolder,
              dateCreated: u.dateCreated,
              dateUpdated: u.dateUpdated,
            };
      });
    } else {
      return this.usersService.getListOfUsers();
    }
  }
}
