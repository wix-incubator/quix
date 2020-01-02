import {
  Body,
  Controller,
  Post,
  Get,
  UsePipes,
  UseGuards,
  HttpCode,
  Param,
  Query,
} from '@nestjs/common';
import {AnyAction} from 'shared/entities/common/common-types';
import {BaseActionValidation} from '../event-sourcing/base-action-validation';
import {QuixEventBus} from '../event-sourcing/quix-event-bus';
import {User, IGoogleUser} from 'modules/auth';
import {AuthGuard} from '@nestjs/passport';
import {IAction} from 'modules/event-sourcing/infrastructure/types';
import {takeRightWhile} from 'lodash';
import {EventsService} from 'modules/event-sourcing/events.service';

@Controller('/api/events')
export class EventsController {
  constructor(
    private eventBus: QuixEventBus,
    private eventsService: EventsService,
  ) {}

  @Post()
  @UseGuards(AuthGuard())
  @UsePipes(BaseActionValidation)
  @HttpCode(200)
  async pushEvents(
    @Body() userAction: AnyAction | AnyAction[],
    @User() user: IGoogleUser,
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
