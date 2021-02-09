import {
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import {Observable, EMPTY, from} from 'rxjs';
import {map} from 'rxjs/operators';
import WebSocket, {Server} from 'ws';
import {EventsService} from '../../modules/event-sourcing/events.service';
import {IAction} from '../../modules/event-sourcing/infrastructure/types';
import {AnyAction} from '@wix/quix-shared/entities/common/common-types';
import {cloneDeep} from 'lodash';
import {LoginService} from '../auth/login.service';

interface ExtendedWebSocket extends WebSocket {
  userId?: string;
  sessionId?: string;
}

@WebSocketGateway({path: '/subscription'})
export class EventsGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private eventsService: EventsService,
    private loginService: LoginService,
  ) {}

  handleDisconnect(client: ExtendedWebSocket) {
    const {userId, sessionId} = client;
    if (userId && sessionId) {
      this.eventsService.closeEventStream(sessionId, userId);
    }
  }

  @SubscribeMessage('subscribe')
  onSubscribe(
    client: ExtendedWebSocket,
    data: any,
  ): Observable<WsResponse<any>> {
    const {token, sessionId} = data;

    try {
      // alternative to sending the user token explicitly - use OnGatewayConnect, and parse cookies
      const user = this.loginService.verify(token);

      if (!user) {
        return from([{event: 'error', data: 'invalid user'}]);
      }

      /* mutating ws client feels weird, but apparently that's the way to go */
      /* https://github.com/websockets/ws/issues/859 */
      client.userId = user.id;
      client.sessionId = sessionId;

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
