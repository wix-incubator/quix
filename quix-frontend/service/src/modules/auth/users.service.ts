import {Injectable} from '@nestjs/common';
import {QuixEventBus} from 'modules/event-sourcing/quix-event-bus';
import {Repository} from 'typeorm';
import {DbUser} from 'entities';
import {InjectRepository} from '@nestjs/typeorm';
import {dbUserToUser} from 'entities/user.entity';
import {UserProfile} from './types';
import {FileActions, createFolder} from 'shared/entities/file';
import uuid from 'uuid/v4';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(DbUser) private userRepo: Repository<DbUser>,
    private quixEventBus: QuixEventBus,
  ) {}

  async doUserLogin(userFromLogin: UserProfile) {
    const user = await this.userRepo.findOne({id: userFromLogin.email});
    if (!user) {
      await this.doFirstTimeLogin(userFromLogin);
    }
  }

  async doFirstTimeLogin(userFromLogin: UserProfile) {
    const rootFolderId = await this.createRootFolder(userFromLogin.email);
    const {avatar, email: id, name} = userFromLogin;
    const dbUser: DbUser = {avatar, id, name, rootFolder: rootFolderId};
    return this.userRepo.save(dbUser);
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
    const dbusers = await this.userRepo.find();
    return dbusers.map(dbUserToUser);
  }
}
