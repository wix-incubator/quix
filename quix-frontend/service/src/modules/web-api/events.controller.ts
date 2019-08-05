import {
  Body,
  Controller,
  Post,
  UsePipes,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import {AnyAction} from 'shared/entities/common/common-types';
import {BaseActionValidation} from '../event-sourcing/base-action-validation';
import {QuixEventBus} from '../event-sourcing/quix-event-bus';
import {User, IGoogleUser} from 'modules/auth';
import {AuthGuard} from '@nestjs/passport';
import {IAction} from 'modules/event-sourcing/infrastructure/types';

@Controller('/api/events')
export class EventsController {
  constructor(private eventBus: QuixEventBus) {}

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
}
