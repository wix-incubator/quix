import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import {Observable, EMPTY} from 'rxjs';
import {map} from 'rxjs/operators';
import {Server} from 'ws';
import {IGoogleUser} from 'modules/auth';
import {EventsService} from 'modules/event-sourcing/events.service';
import {IAction} from 'modules/event-sourcing/infrastructure/types';
import {AnyAction} from 'shared/entities/common/common-types';
import {cloneDeep} from 'lodash';
import {auth} from 'modules/auth/common-auth';

@WebSocketGateway({path: '/subscription'})
export class EventsGateway {
  @WebSocketServer()
  server!: Server;

  constructor(private eventsService: EventsService) {}

  @SubscribeMessage('subscribe')
  onSubscribe(client: any, data: any): Observable<WsResponse<any>> {
    const {token, sessionId} = data;

    try {
      const user: IGoogleUser = auth(token);

      return this.eventsService.getEventStream(sessionId, user.id).pipe(
        map((action: IAction) => ({
          event: 'action',
          data: this.sanitizeAction(action),
        })),
      );
    } catch (e) {
      client.close();
      return EMPTY;
    }
  }

  sanitizeAction(action: IAction): AnyAction {
    const result = cloneDeep(action);
    delete (result as any).user;
    delete result.userId;
    delete result.sessionId;
    return result;
  }
}
