import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DbUser, userToDbUser} from '../../../entities/user/user.entity';
import {UserActions, UserActionTypes} from '@wix/quix-shared/entities/user';
import {Repository} from 'typeorm';
import {EventBusPlugin, EventBusPluginFn} from '../infrastructure/event-bus';
import {IAction} from '../infrastructure/types';
import {QuixHookNames} from '../types';
import {extractEventNames} from './utils';

@Injectable()
export class UserPlugin implements EventBusPlugin {
  name = 'user';

  constructor(
    @InjectRepository(DbUser)
    private userRepository: Repository<DbUser>,
  ) {}

  registerFn: EventBusPluginFn = api => {
    const handledEvents: string[] = extractEventNames(UserActionTypes);

    api.setEventFilter(type => handledEvents.includes(type));

    api.hooks.listen(
      QuixHookNames.VALIDATION,
      async (action: IAction<UserActions>) => {
        switch (action.type) {
          case UserActionTypes.createNewUser:
          case UserActionTypes.updateUser:
        }
      },
    );

    api.hooks.listen(
      QuixHookNames.PROJECTION,
      async (action: IAction<UserActions>) => {
        switch (action.type) {
          case UserActionTypes.createNewUser: {
            const dbUser = userToDbUser(action.newUser);
            return this.userRepository.insert(dbUser);
          }
          case UserActionTypes.updateUser: {
            const {id, avatar, email, name, changeUserCreated} = action;
            const dbUser = new DbUser({
              id,
              avatar,
              name,
            });
            if (changeUserCreated) {
              dbUser.dateCreated = changeUserCreated.valueOf();
            }
            return this.userRepository.save(dbUser, {reload: false});
          }
        }
      },
    );
  };
}
