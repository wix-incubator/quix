package quix.web.controllers

import java.util.concurrent.ConcurrentHashMap

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import monix.execution.{CancelableFuture, Scheduler}
import org.springframework.web.socket.handler.{ConcurrentWebSocketSessionDecorator, TextWebSocketHandler}
import org.springframework.web.socket.{CloseStatus, TextMessage, WebSocketSession}
import quix.api.execute._
import quix.api.module.ExecutionModule
import quix.api.users.{User, Users}
import quix.core.results.MultiBuilder
import quix.core.utils.JsonOps.Implicits.global
import quix.core.utils.StringJsonHelpersSupport
import quix.core.utils.TaskOps._

import scala.util.Try

class SqlStreamingController(val modules: Map[String, ExecutionModule[String, Batch]],
                             val users: Users,
                             val downloads: DownloadableQueries[String, Batch, ExecutionEvent],
                             val io: Scheduler)
  extends TextWebSocketHandler with LazyLogging with StringJsonHelpersSupport {

  val executions = new ConcurrentHashMap[String, CancelableFuture[Unit]]

  def handleUnknownMessage(socket: WebSocketSession, payload: String, user: User) = {
    val task = Task {
      logger.info(s"event=unknown-message socket-id=${socket.getId} payload=$payload")
      socket.sendMessage(new TextMessage(Error(socket.getId, s"Failed to handle unknown message : [$payload]").asJsonStr))
    }

    task.executeOn(io).runAsyncAndForget(io)
  }

  override def handleTextMessage(socket: WebSocketSession, message: TextMessage): Unit = users.auth(getHeaders(socket)) { user =>
    logger.info(s"event=handle-text-message socket-id=${socket.getId} message=${message.getPayload} user=${user.email}")

    message.getPayload match {
      case ExecutionEvent("ping", _) =>
        handlePingMessage(socket)

      case ExecutionEvent("execute", command: StartCommand[String]) =>
        val threadSafeSocket = new ConcurrentWebSocketSessionDecorator(socket, 1000, 1024 * 1024 )
        handleExecutionMessage(threadSafeSocket, command, user)

      case _ =>
        handleUnknownMessage(socket, message.getPayload, user)
    }
  }

  private def handleExecutionMessage(socket: WebSocketSession, payload: StartCommand[String], user: User) = {
    val queryType = socket.getUri.toString.split("/").last

    val initConsumer = Task.eval(new WebsocketConsumer[ExecutionEvent](socket.getId, user, socket))
    val useConsumer = (consumer: WebsocketConsumer[ExecutionEvent]) => {
      modules.get(queryType) match {
        case Some(module) =>
          logger.info(s"event=start-execution socket-id=${socket.getId} sql=${payload.code} uri=${socket.getUri} queryType=$queryType")
          module.start(payload, consumer.id, consumer.user, makeResultBuilder(consumer, payload.session))
        case None =>
          logger.warn(s"event=start-execution-failure message=unknown-query-type socket-id=${socket.getId} sql=${payload.code} uri=${socket.getUri} queryType=$queryType")
          Task.unit
      }
    }

    val closeConsumer = (consumer: WebsocketConsumer[ExecutionEvent]) => consumer.close()

    val task = initConsumer.bracket(useConsumer)(closeConsumer)

    val future = task
      .logOnError(s"event=execution-failure socket-id=${socket.getId} sql=[${payload.code.replace("\n", "-newline-")}]")
      .executeOn(io).runToFuture(io)
    executions.put(socket.getId, future)
  }

  private def handlePingMessage(socket: WebSocketSession) = {
    val task = Task {
      logger.info(s"event=ping socket-id=${socket.getId}")
      socket.sendMessage(new TextMessage(Pong(socket.getId).asJsonStr))
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

  def makeResultBuilder(consumer: Consumer[ExecutionEvent], session: Map[String, String]) = {
    if (session.get("mode").contains("download")) {
      downloads.adapt(new MultiBuilder[String](consumer), consumer)
    } else {
      new MultiBuilder[String](consumer)
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

object Start extends StringJsonHelpersSupport {
  def unapply(payload: String): Option[StartCommand[String]] = {
    Try {
      val command = payload.as[StartCommand[String]]

      assert(command.code != null)

      command.copy(session = Option(command.session).getOrElse(Map.empty))
    }.toOption
  }
}

object ExecutionEvent extends StringJsonHelpersSupport {
  def unapply(event: String): Option[(String, EventData)] = {
    val name = event.get("event")
    val data = event.get("data")

    (name, data) match {
      case ("ping", _) =>
        Some(name, Empty)

      case ("execute", Start(command)) =>
        Some(name, command)

      case (_, _) =>
        Some(name, Empty)
    }
  }
}