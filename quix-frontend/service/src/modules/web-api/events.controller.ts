import {
  Body,
  Controller,
  HttpCode,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {AuthGuard} from '../auth';
import {AnyAction} from '@wix/quix-shared/entities/common/common-types';
import {IExternalUser, User} from '../../modules/auth';
import {EventsService} from '../../modules/event-sourcing/events.service';
import {IAction} from '../../modules/event-sourcing/infrastructure/types';
import {BaseActionValidation} from '../event-sourcing/base-action-validation';
import {QuixEventBus} from '../event-sourcing/quix-event-bus';

@Controller('/api/events')
export class EventsController {
  constructor(
    private eventBus: QuixEventBus,
    private eventsService: EventsService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(BaseActionValidation)
  @HttpCode(200)
  async pushEvents(
    @Body() userAction: AnyAction | AnyAction[],
    @User() user: IExternalUser,
    @Query('sessionId') sessionId: string,
  ) {
    if (Array.isArray(userAction)) {
      const actions: IAction[] = userAction.map(singleAction => ({
        ...singleAction,
        user: user.email,
        userId: user.id,
        sessionId,
      }));
      return this.eventBus.emit(actions);
    } else {
      const action: IAction = {
        ...userAction,
        user: user.email,
        userId: user.id,
        sessionId,
      };
      return this.eventBus.emit(action);
    }
  }
}
