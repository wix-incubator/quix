import {Body, Controller, Inject, Post, Req, UsePipes} from '@nestjs/common';
import {Request} from 'express';

import {DefaultAction} from '../../../../shared/entities/common/common-types';
import {BaseActionValidation} from './base-action-validation';
import {QuixEventBus} from './quix-event-bus';
import {AuthService} from '../auth/auth.service';

@Controller('/api/events')
export class EventsController {
  constructor(
    private eventBus: QuixEventBus,
    private authService: AuthService,
  ) {}

  @Post()
  @UsePipes(BaseActionValidation)
  async pushEvents(
    @Body() action: DefaultAction | DefaultAction[],
    @Req() request: Request,
  ) {
    const user = await this.authService.getUser(request);
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
