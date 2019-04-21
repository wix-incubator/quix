package quix.web.controllers

import java.util.concurrent.ConcurrentHashMap

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import monix.execution.{CancelableFuture, Scheduler}
import org.springframework.web.socket.handler.TextWebSocketHandler
import org.springframework.web.socket.{CloseStatus, TextMessage, WebSocketSession}
import quix.api.execute.{Consumer, DownloadableQueries, StartCommand}
import quix.api.users.{User, Users}
import quix.core.utils.JsonOps.Implicits.global
import quix.core.utils.StringJsonHelpersSupport
import quix.presto.rest.Results
import quix.presto.{MultiResultBuilder, PrestoEvent, PrestoQuixModule}

class PrestoController(val prestoModule: PrestoQuixModule, users: Users, val downloadableQueries: DownloadableQueries[Results])
  extends TextWebSocketHandler with LazyLogging with StringJsonHelpersSupport {

  val io = Scheduler.io("presto-executor")

  val executions = new ConcurrentHashMap[String, CancelableFuture[Unit]]

  override def handleTextMessage(socket: WebSocketSession, message: TextMessage): Unit = users.auth(getHeaders(socket)) { user =>
    logger.info(s"event=handle-text-message socket-id=${socket.getId} message=${message.getPayload} user=${user.email}")

    if (message.getPayload == "ping") {
      handlePingMessage(socket)
    } else {
      handleExecutionMessage(socket, message, user)
    }
  }

  private def handleExecutionMessage(socket: WebSocketSession, message: TextMessage, user: User) = {
    val payload = message.getPayload.as[StartCommand[String]]

    val initConsumer = Task.eval(new WebsocketConsumer[PrestoEvent](socket.getId, user, socket))
    val useConsumer = (consumer: WebsocketConsumer[PrestoEvent]) => {

      prestoModule.start(payload, consumer.id, consumer.user, makeResultBuilder(consumer, payload.session))
    }

    val closeConsumer = (consumer: WebsocketConsumer[PrestoEvent]) => consumer.close()

    val task = initConsumer.bracket(useConsumer)(closeConsumer)

    val future = task.executeOn(io).runToFuture(io)
    executions.put(socket.getId, future)
  }

  private def handlePingMessage(socket: WebSocketSession) = {
    val task = Task {
      logger.info(s"event=ping socket-id=${socket.getId}")
      socket.sendMessage(new TextMessage("pong"))
    }

    task.runAsyncAndForget(io)
  }

  override def afterConnectionClosed(socket: WebSocketSession, status: CloseStatus): Unit = users.auth(getHeaders(socket)) { user =>
    logger.info(s"event=connection-closed status=$status socket-id=${socket.getId} user=${user.email}")

    for (execution <- Option(executions.remove(socket.getId)))
      execution.cancel()
  }

  def getHeaders(socket: WebSocketSession): Map[String, String] = {
    import scala.collection.JavaConverters._
    socket.getAttributes.asScala.mapValues(String.valueOf).toMap
  }

  def makeResultBuilder(consumer: WebsocketConsumer[PrestoEvent], session: Map[String, String]) = {
    if (session.get("mode").contains("download")) {
      downloadableQueries.adapt(new MultiResultBuilder(consumer))
    } else {
      new MultiResultBuilder(consumer)
    }
  }
}

class WebsocketConsumer[Results](val id: String, val user: User, socket: WebSocketSession)
  extends Consumer[Results] with StringJsonHelpersSupport with LazyLogging {

  override def write(payload: Results) = Task {
    logger.trace(s"event=write-payload socket-id=${socket.getId} user=${user.email} payload=[$payload]")
    socket.sendMessage(new TextMessage(payload.asJsonStr))
  }

  override def close() = Task {
    logger.info(s"event=socket-close socket-id=${socket.getId} user=${user.email}")

    if (socket.isOpen)
      socket.close()
  }
}