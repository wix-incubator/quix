import {Injectable, Logger} from '@nestjs/common';
import {QuixEventBus} from '../../modules/event-sourcing/quix-event-bus';
import {Repository} from 'typeorm';
import {DbUser} from '../../entities';
import {InjectRepository} from '@nestjs/typeorm';
import {dbUserToUser} from '../../entities/user/user.entity';
import {IExternalUser} from './types';
import {FileActions, createFolder} from '@wix/quix-shared/entities/file';
import uuid from 'uuid/v4';
import {UserActions, createUser} from '@wix/quix-shared/entities/user';

@Injectable()
export class UsersService {
  private logger = new Logger('UsersService');

  constructor(
    @InjectRepository(DbUser) private userRepo: Repository<DbUser>,
    private quixEventBus: QuixEventBus,
  ) {}

  async doUserLogin(userFromLogin: IExternalUser) {
    const user = await this.userRepo.findOne({id: userFromLogin.email});
    if (!user) {
      await this.doFirstTimeLogin(userFromLogin);
    } else {
      await this.doLogin(userFromLogin, user);
    }
  }

  private async doFirstTimeLogin(userFromLogin: IExternalUser) {
    const rootFolderId = await this.createRootFolder(userFromLogin.email);
    const {avatar, email: id, email, name} = userFromLogin;
    const user = createUser({
      avatar,
      email,
      id,
      name,
      rootFolder: rootFolderId,
    });

    return this.quixEventBus.emit({
      ...UserActions.createNewUser(id, user),
      user: id,
      ethereal: true,
    });
  }

  private async doLogin(userFromLogin: IExternalUser, dbUser: DbUser) {
    const {avatar, name, email: id, email} = userFromLogin;
    /* small hack when migrating users, creating users with epoch 1000 (1970-01-01 00:00:01) */
    /* once they login, change dateCreated */
    const changeUserCreated =
      dbUser.dateCreated.valueOf() === 1000 ? new Date() : undefined;

    return this.quixEventBus.emit({
      ...UserActions.updateUser(
        id,
        avatar || '',
        name || '',
        email,
        changeUserCreated,
      ),
      user: id,
      ethereal: true,
    });
  }

  private async createRootFolder(user: string) {
    const id = uuid();
    await this.quixEventBus.emit({
      ...FileActions.createFile(
        id,
        createFolder([], {id, name: 'My notebooks'}),
      ),
      user,
      reason: 'first login',
    });
    return id;
  }

  async getListOfUsers() {
    const dbUsers = await this.userRepo.find();
    return dbUsers.map(dbUserToUser);
  }
}
