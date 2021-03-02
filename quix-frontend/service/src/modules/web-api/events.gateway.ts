import {
  OnGatewayConnection,
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
import {IncomingMessage} from 'http';
import {parse} from 'cookie';
import {Inject} from '@nestjs/common';
import {AuthOptions, AuthTypes, IExternalUser} from '../auth/types';
interface ExtendedWebSocket extends WebSocket {
  userId?: string;
  sessionId?: string;
}
@WebSocketGateway({path: '/subscription'})
export class EventsGateway implements OnGatewayDisconnect, OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private eventsService: EventsService,
    private loginService: LoginService,
    @Inject(AuthOptions) private authOptions: AuthOptions,
  ) {}

  handleConnection(client: ExtendedWebSocket, msg: IncomingMessage) {
    let user: IExternalUser | undefined;
    if (this.authOptions.type === AuthTypes.CUSTOM) {
      const token = this.authOptions.auth.getTokenFromRequest(msg);
      user = this.loginService.verify(token);
    } else {
      const cookies = parse(msg.headers.cookie || '');
      const token = cookies[this.authOptions.cookieName];
      user = this.loginService.verify(token);
    }
    if (user) {
      /* mutating ws client feels weird, but apparently that's the way to go */
      /* https://github.com/websockets/ws/issues/859 */
      client.userId = user.id;
    }
  }

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
    const {sessionId} = data;

    try {
      const userId = client.userId;
      if (!userId) {
        return from([{event: 'error', data: 'invalid user'}]);
      }

      client.sessionId = sessionId;

      return this.eventsService.getEventStream(sessionId, userId).pipe(
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
