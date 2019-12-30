import {
  Body,
  Controller,
  Post,
  Get,
  UsePipes,
  UseGuards,
  HttpCode,
  Param,
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
  ) {
    if (Array.isArray(userAction)) {
      const actions: IAction[] = userAction.map(singleAction =>
        Object.assign(singleAction, {user: user.email}),
      );
      return this.eventBus.emit(actions);
    } else {
      const action: IAction = {...userAction, user: user.email};
      return this.eventBus.emit(action);
    }
  }

  @Get('latest')
  @UseGuards(AuthGuard())
  @HttpCode(200)
  async getLatest(@User() user: IGoogleUser) {
    const events = this.eventsService.getEvents(user.email);
    const latestEventId = events[events.length - 1].id;
    return {latestEventId};
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  @HttpCode(200)
  async getAfter(@User() user: IGoogleUser, @Param('id') id: string) {
    return takeRightWhile(
      this.eventsService.getEvents(user.email),
      event => event.id !== id,
    );
  }
}
