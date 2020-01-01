import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
  OnGatewayConnection,
} from '@nestjs/websockets';
import {from, Observable, EMPTY} from 'rxjs';
import {map} from 'rxjs/operators';
import {Server} from 'ws';
import {User, IGoogleUser} from 'modules/auth';
import {UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {EventsService} from 'modules/event-sourcing/events.service';
import {IAction} from 'modules/event-sourcing/infrastructure/types';
import {AnyAction} from 'shared/entities/common/common-types';
import {cloneDeep} from 'lodash';
import {auth} from 'modules/auth/common-auth';

@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()
  server!: Server;

  constructor(private eventsService: EventsService) {}

  @SubscribeMessage('events')
  // @UseGuards(AuthGuard())
  onEvent(client: any, data: any): Observable<WsResponse<any>> {
    // console.log({data, client});

    return from([1, 2, 3]).pipe(
      map(item => ({event: 'events', data: {item, test: 'test', user: 'a'}})),
    );
  }

  @SubscribeMessage('subscribe')
  onSubscribe(client: any, data: any): Observable<WsResponse<any>> {
    const {token, sessionId} = data;

    try {
      const user: IGoogleUser = auth(token);

      return this.eventsService.getEventStream(sessionId, user.id).pipe(
        map((data: IAction) => ({
          event: 'action',
          data: this.sanitizeAction(data),
        })),
      );
    } catch (e) {
      client.close();
      return EMPTY;
    }
  }

  sanitizeAction(action: IAction): AnyAction {
    const result = cloneDeep(action);
    delete result.user;
    delete result.userId;
    delete result.sessionId;
    return result;
  }
}
