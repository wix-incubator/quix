package quix.web

import org.asynchttpclient.Dsl.asyncHttpClient
import org.asynchttpclient.ws.{WebSocket, WebSocketListener, WebSocketUpgradeHandler}
import quix.api.execute.StartCommand
import quix.core.utils.JsonOps.Implicits.global
import quix.core.utils.StringJsonHelpersSupport
import scalaj.http.Http

trait E2EContext extends StringJsonHelpersSupport {
  val c = asyncHttpClient()

  def get[T: Manifest](url: String): T = {
    Http("http://localhost:8888/" + url).asString.body.as[T]
  }

  def getResponse(url: String) = {
    Http("http://localhost:8888/" + url).asString
  }

  def execute(sql: String, session: Map[String, String] = Map.empty) = startSocket(true, StartCommand[String](sql, session).asJsonStr)

  def execute(sql: String, text: String) = startSocket(true, StartCommand[String](sql, Map.empty).asJsonStr, text)

  def runAndDownload(sql: String) =
    startSocket(false, StartCommand[String](sql, Map("mode" -> "download")).asJsonStr)

  def startSocket(awaitFinish: Boolean, texts: String*) = {
    val listener = new MyListener(texts: _*)

    val handler = new WebSocketUpgradeHandler.Builder().addWebSocketListener(listener).build()

    c.prepareGet("ws://localhost:8888/api/v1/execute/sql").execute(handler)

    while(listener.messages.isEmpty)
      Thread.sleep(10)

    if (awaitFinish) {
      while (!listener.closed)
        Thread.sleep(10)
    }

    listener
  }
}

class MyListener(payloads: String*) extends WebSocketListener with StringJsonHelpersSupport {

  import scala.collection.JavaConverters._

  val messages = scala.collection.mutable.ListBuffer.empty[String]
  var closed = false
  var opened = false

  def messagesJ = messages.asJava

  override def onOpen(websocket: WebSocket): Unit = {
    opened = true

    for (payload <- payloads) {
      websocket.sendTextFrame(payload)
      Thread.sleep(500)
    }
  }

  override def onClose(websocket: WebSocket, code: Int, reason: String): Unit = {
    closed = true
    opened = false
  }

  override def onError(t: Throwable): Unit = {}

  override def onTextFrame(payload: String, finalFragment: Boolean, rsv: Int): Unit = {
    messages += payload
  }
}