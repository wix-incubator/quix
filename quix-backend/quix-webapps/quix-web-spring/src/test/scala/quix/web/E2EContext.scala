package quix.web


import org.asynchttpclient.Dsl.asyncHttpClient
import org.asynchttpclient.ws.{WebSocket, WebSocketListener, WebSocketUpgradeHandler}
import org.junit.runner.RunWith
import org.specs2.mutable.Spec
import org.specs2.specification.BeforeAfterEach
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment.DEFINED_PORT
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.context.{TestContextManager, TestPropertySource}
import org.springframework.test.context.junit4.SpringRunner
import quix.api.v1.execute.{ExecutionEvent, StartCommand}
import quix.core.utils.JsonOps.Implicits.global
import quix.core.utils.StringJsonHelpersSupport
import scalaj.http.Http

import scala.collection.mutable.ListBuffer
import scala.concurrent.duration.Duration
import scala.concurrent.{Await, Promise}

@RunWith(classOf[SpringRunner])
@DirtiesContext
@SpringBootTest(webEnvironment = DEFINED_PORT, classes = Array(classOf[SpringConfigWithTestExecutor]))
@TestPropertySource(locations = Array("classpath:test.properties"))
abstract class MySpecWithSpring extends Spec

trait E2EContext extends MySpecWithSpring with StringJsonHelpersSupport with BeforeAfterEach {

  new TestContextManager(this.getClass).prepareTestInstance(this)

  def before: Any = {}

  def after: Any = {}

  val c = asyncHttpClient()

  val jettyPort = "8888"

  def get[T: Manifest](url: String, port: String = jettyPort): T = {
    Http(s"http://localhost:$port/" + url).asString.body.as[T]
  }

  def getResponse(url: String, port: String = jettyPort) = {
    Http(s"http://localhost:$port" + url).asString
  }

  def execute(sql: String, session: Map[String, String] = Map.empty,
              module: String, port: String = jettyPort) = {
    startSocket(true, List(ExecutionEvent("execute", StartCommand[String](sql, session)).asJsonStr), module, port)
  }

  def send(text: String,
           module: String, port: String = jettyPort) = {
    startSocket(false, List(text), module, port)
  }

  def runAndDownload(sql: String, module: String, port: String = jettyPort) = {
    startSocket(false,
      List(ExecutionEvent("execute", StartCommand[String](sql, Map("mode" -> "download"))).asJsonStr),
      module,
      port
    )
  }


  def startSocket(awaitFinish: Boolean, texts: List[String], module: String, port: String) = {
    val listener = new MyListener(texts)

    val handler = new WebSocketUpgradeHandler.Builder().addWebSocketListener(listener).build()

    c.prepareGet(s"ws://localhost:$port/api/v1/execute/$module").execute(handler)

    while (listener.messages.isEmpty)
      Thread.sleep(10)

    if (awaitFinish) {
      listener.awaitClosed()
    }

    listener
  }

  def containEvent(e: String) = {
    val event = e
      .replace("*", "\\*")
      .replace("[", "\\[")
      .replace("]", "\\]")
      .replace("{", "\\{")
      .replace("}", "\\}")
      .replaceAll("query-id", """.{36,37}""")

    contain(beMatching(event))
  }
}

class MyListener(payloads: List[String]) extends WebSocketListener with StringJsonHelpersSupport {

  import scala.collection.JavaConverters._

  private val closed = Promise[Unit]

  val messages = ListBuffer.empty[String]
  var opened = false

  def messagesJ = messages.asJava

  override def onOpen(websocket: WebSocket): Unit = {
    opened = true

    for (payload <- payloads) {
      websocket.sendTextFrame(payload)
    }
  }

  override def onClose(websocket: WebSocket, code: Int, reason: String): Unit = {
    closed.success(())
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

  def awaitClosed(atMost: Duration = Duration.Inf): Unit =
    Await.result(closed.future, atMost)
}
