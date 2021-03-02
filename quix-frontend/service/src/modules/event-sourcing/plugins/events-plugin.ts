import {Inject, Injectable} from '@nestjs/common';
import {EventsService} from '../events.service';
import {EventBusPlugin, EventBusPluginFn} from '../infrastructure/event-bus';
import {IAction} from '../infrastructure/types';
import {QuixHookNames} from '../types';

@Injectable()
export class EventsPlugin implements EventBusPlugin {
  name = 'events';

  constructor(@Inject(EventsService) private eventsService: EventsService) {}

  registerFn: EventBusPluginFn = api => {
    api.hooks.listen(QuixHookNames.PROJECTION, async (action: IAction) => {
      if (!action.ethereal) {
        this.eventsService.logEvent(action);
      }
    });
  };
}
