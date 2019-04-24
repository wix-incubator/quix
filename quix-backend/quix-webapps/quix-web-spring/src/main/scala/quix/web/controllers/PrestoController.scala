package quix.web.controllers

import java.util.concurrent.ConcurrentHashMap

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import monix.execution.{CancelableFuture, Scheduler}
import org.springframework.web.socket.handler.TextWebSocketHandler
import org.springframework.web.socket.{CloseStatus, TextMessage, WebSocketSession}
import quix.api.execute._
import quix.api.users.{User, Users}
import quix.core.results.MultiBuilder
import quix.core.utils.JsonOps.Implicits.global
import quix.core.utils.StringJsonHelpersSupport
import quix.core.utils.TaskOps._
import quix.presto._

import scala.util.Try

class PrestoController(val prestoModule: PrestoQuixModule, users: Users, val downloadableQueries: DownloadableQueries[Batch, ExecutionEvent])
  extends TextWebSocketHandler with LazyLogging with StringJsonHelpersSupport {

  val io = Scheduler.io("presto-executor")

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
      case "ping" =>
        handlePingMessage(socket)

      case """"ping"""" =>
        handlePingMessage(socket)

      case """{"event":"ping"}""" =>
        handlePingMessage(socket)

      case Start(command) =>
        handleExecutionMessage(socket, command, user)

      case _ =>
        handleUnknownMessage(socket, message.getPayload, user)
    }
  }

  private def handleExecutionMessage(socket: WebSocketSession, payload: StartCommand[String], user: User) = {
    val initConsumer = Task.eval(new WebsocketConsumer[ExecutionEvent](socket.getId, user, socket))
    val useConsumer = (consumer: WebsocketConsumer[ExecutionEvent]) => {
      logger.info(s"event=start-execution socket-id=${socket.getId} sql=${payload.code}")
      prestoModule.start(payload, consumer.id, consumer.user, makeResultBuilder(consumer, payload.session))
    }

    val closeConsumer = (consumer: WebsocketConsumer[ExecutionEvent]) => consumer.close()

    val task = initConsumer.bracket(useConsumer)(closeConsumer)

    val future = task
      .logOnError(s"event=execution-failure socket-id=${socket.getId} sql=${payload.code}")
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
      downloadableQueries.adapt(new MultiBuilder(consumer), consumer)
    } else {
      new MultiBuilder(consumer)
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
      assert(command.code.nonEmpty)

      command.copy(session = Option(command.session).getOrElse(Map.empty))
    }.toOption
  }
}