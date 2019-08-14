import {Injectable, Logger} from '@nestjs/common';
import {QuixEventBus} from 'modules/event-sourcing/quix-event-bus';
import {Repository} from 'typeorm';
import {DbUser} from 'entities';
import {InjectRepository} from '@nestjs/typeorm';
import {dbUserToUser} from 'entities/user/user.entity';
import {IGoogleUser} from './types';
import {FileActions, createFolder} from 'shared/entities/file';
import uuid from 'uuid/v4';
import {UserActions, createUser} from 'shared/entities/user';

@Injectable()
export class UsersService {
  private logger = new Logger('UsersService');

  constructor(
    @InjectRepository(DbUser) private userRepo: Repository<DbUser>,
    private quixEventBus: QuixEventBus,
  ) {}

  async doUserLogin(userFromLogin: IGoogleUser) {
    const user = await this.userRepo.count({id: userFromLogin.email});
    if (!user) {
      await this.doFirstTimeLogin(userFromLogin);
    } else {
      await this.doLogin(userFromLogin);
    }
  }

  private async doFirstTimeLogin(userFromLogin: IGoogleUser) {
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

  private async doLogin(userFromLogin: IGoogleUser) {
    const {avatar, name, email: id, email} = userFromLogin;
    return this.quixEventBus.emit({
      ...UserActions.updateUser(id, avatar || '', name || '', email),
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
