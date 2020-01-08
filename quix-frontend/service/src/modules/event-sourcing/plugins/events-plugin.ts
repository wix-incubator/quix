import {Injectable, Inject} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DbUser, userToDbUser} from 'entities/user/user.entity';
import {UserActions, UserActionTypes} from 'shared/entities/user';
import {Repository} from 'typeorm';
import {EventBusPlugin, EventBusPluginFn} from '../infrastructure/event-bus';
import {IAction} from '../infrastructure/types';
import {QuixHookNames} from '../types';
import {extractEventNames} from './utils';
import {EventsService} from '../events.service';

@Injectable()
export class EventsPlugin implements EventBusPlugin {
  name = 'events';

  constructor(@Inject(EventsService) private eventsService: EventsService) {}

  registerFn: EventBusPluginFn = api => {
    api.hooks.listen(
      QuixHookNames.VALIDATION,
      async (action: IAction) => undefined,
    );
    api.hooks.listen(QuixHookNames.PROJECTION, async (action: IAction) => {
      this.eventsService.logEvent(action);
    });
  };
}
