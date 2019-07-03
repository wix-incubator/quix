package quix.web


import org.asynchttpclient.Dsl.asyncHttpClient
import org.asynchttpclient.ws.{WebSocket, WebSocketListener, WebSocketUpgradeHandler}
import quix.api.execute.{ExecutionEvent, StartCommand}
import quix.core.utils.JsonOps.Implicits.global
import quix.core.utils.StringJsonHelpersSupport
import scalaj.http.Http

trait E2EContext extends StringJsonHelpersSupport {
  val c = asyncHttpClient()

  val webSocketModuleSuffixPresto = "presto"
  val jettyPort = "8888"

  def get[T: Manifest](url: String , port:String = jettyPort): T = {
    Http(s"http://localhost:$port/" + url).asString.body.as[T]
  }

  def getResponse(url: String, port: String = jettyPort) = {
    Http(s"http://localhost:$port" + url).asString
  }

  def execute(sql: String, session: Map[String, String] = Map.empty,
              webSocketModuleSuffix: String = webSocketModuleSuffixPresto, port: String = jettyPort) = {
    startSocket(true, List(ExecutionEvent("execute", StartCommand[String](sql, session)).asJsonStr), webSocketModuleSuffix, port)
  }

  def send(text: String,
           webSocketModuleSuffix: String = webSocketModuleSuffixPresto, port: String = jettyPort) = {
    startSocket(false, List(text), webSocketModuleSuffix, port)
  }

  def runAndDownload(sql: String, webSocketModuleSuffix: String = webSocketModuleSuffixPresto, port: String = jettyPort) = {
    startSocket(false,
      List(ExecutionEvent("execute", StartCommand[String](sql, Map("mode" -> "download"))).asJsonStr),
      webSocketModuleSuffix,
      port
    )
  }


  def startSocket(awaitFinish: Boolean, texts: List[String], webSocketModuleSuffix: String , port: String) = {
    val listener = new MyListener(texts: List[String])

    val handler = new WebSocketUpgradeHandler.Builder().addWebSocketListener(listener).build()

    c.prepareGet(s"ws://localhost:$port/api/v1/execute/$webSocketModuleSuffix").execute(handler)

    while (listener.messages.isEmpty)
      Thread.sleep(10)

    if (awaitFinish) {
      while (!listener.closed)
        Thread.sleep(10)
    }

    listener
  }
}

class MyListener(payloads: List[String]) extends WebSocketListener with StringJsonHelpersSupport {

  import scala.collection.JavaConverters._

  val messages = scala.collection.mutable.ListBuffer.empty[String]
  var closed = false
  var opened = false

  def messagesJ = messages.asJava

  override def onOpen(websocket: WebSocket): Unit = {
    opened = true

    for (payload <- payloads) {
      websocket.sendTextFrame(payload)
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

  def await(message: String) = {
    while (!messages.contains(message))
      Thread.sleep(10)
  }
}