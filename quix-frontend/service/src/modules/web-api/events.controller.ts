import {
  Body,
  Controller,
  HttpCode,
  Logger,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {AuthGuard} from '../auth';
import {AnyAction} from '@wix/quix-shared/entities/common/common-types';
import {IExternalUser, User} from '../../modules/auth';
import {EventsService} from '../../modules/event-sourcing/events.service';
import {
  IAction,
  IEventData,
} from '../../modules/event-sourcing/infrastructure/types';
import {BaseActionValidation} from '../event-sourcing/base-action-validation';
import {QuixEventBus} from '../event-sourcing/quix-event-bus';

@Controller('/api/events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

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
    function withUserInfo(action: AnyAction): IAction<IEventData, string> {
      return {
        ...action,
        user: user.email,
        userId: user.id,
        sessionId,
      };
    }

    let result: IAction<IEventData, string> | IAction<IEventData, string>[] =
      [];

    try {
      result = Array.isArray(userAction)
        ? await this.eventBus.emit(userAction.map(withUserInfo))
        : await this.eventBus.emit(withUserInfo(userAction));
    } catch (e: any) {
      this.logger.error(`got error in /api/events 
      the error is ${e}
      the action was ${JSON.stringify(userAction)}`);
      throw e;
    }

    return {
      reactions: Array.isArray(result) ? result : [],
    };
  }
}
