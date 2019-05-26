import {Body, Controller, Post, UsePipes, UseGuards} from '@nestjs/common';
import {DefaultAction} from 'shared/entities/common/common-types';
import {BaseActionValidation} from '../event-sourcing/base-action-validation';
import {QuixEventBus} from '../event-sourcing/quix-event-bus';
import {User, IGoogleUser} from 'modules/auth';
import {AuthGuard} from '@nestjs/passport';

@Controller('/api/events')
export class EventsController {
  constructor(private eventBus: QuixEventBus) {}

  @Post()
  @UseGuards(AuthGuard())
  @UsePipes(BaseActionValidation)
  async pushEvents(
    @Body() action: DefaultAction | DefaultAction[],
    @User() user: IGoogleUser,
  ) {
    if (Array.isArray(action)) {
      action.forEach(singleAction =>
        Object.assign(singleAction, {user: user.email}),
      );
    } else {
      action.user = user.email;
    }
    return this.eventBus.emit(action);
  }
}
