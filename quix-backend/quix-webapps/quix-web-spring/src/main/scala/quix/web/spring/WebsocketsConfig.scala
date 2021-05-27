package quix.web.spring

import java.util

import com.typesafe.scalalogging.LazyLogging
import monix.execution.Scheduler
import org.eclipse.jetty.websocket.api.WebSocketPolicy
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Configuration
import org.springframework.http.server.{ServerHttpRequest, ServerHttpResponse, ServletServerHttpRequest}
import org.springframework.web.socket.WebSocketHandler
import org.springframework.web.socket.config.annotation.{EnableWebSocket, WebSocketConfigurer, WebSocketHandlerRegistry}
import org.springframework.web.socket.server.HandshakeInterceptor
import org.springframework.web.socket.server.jetty.JettyRequestUpgradeStrategy
import org.springframework.web.socket.server.support.DefaultHandshakeHandler
import quix.api.v1.users.Users
import quix.api.v2.execute.ExecutionModule
import quix.core.download.{DownloadConfig, QueryResultsStorage}
import quix.core.history.dao.HistoryWriteDao
import quix.web.controllers.SqlStreamingController

@Configuration
@EnableWebSocket
class WebsocketsConfig extends LazyLogging with WebSocketConfigurer {

  @Autowired var users: Users = _
  @Autowired var modules: Map[String, ExecutionModule] = _
  @Autowired var downloadConfig: DownloadConfig = _
  @Autowired var queryResultsStorage: QueryResultsStorage = _
  @Autowired var historyWriteDao: HistoryWriteDao = _

  override def registerWebSocketHandlers(registry: WebSocketHandlerRegistry): Unit = {
    val handler = new SqlStreamingController(
      modules = modules,
      users = users,
      downloadConfig = downloadConfig,
      queryResultsStorage = queryResultsStorage,
      historyWriteDao = historyWriteDao,
      io = Scheduler.io("presto-io"))

    val handshakeHandler = {
      val policy = WebSocketPolicy.newServerPolicy()
      policy.setIdleTimeout(10 * 60 * 1000) // 60 seconds
      policy.setInputBufferSize(8092) // 2 KB
      policy.setMaxTextMessageSize(1024 * 1024) // 1 MB

      val requestUpgradeStrategy = new JettyRequestUpgradeStrategy(policy)

      new DefaultHandshakeHandler(requestUpgradeStrategy)
    }

    val endpoints = modules.keys.map(module => "/api/v1/execute/" + module).toList

    logger.info(s"event=[spring-config] bean=[registerWebSocketHandlers] endponts=[$endpoints]")

    registry.addHandler(handler, endpoints: _*)
      .addInterceptors(new CookiesInterceptor)
      .setHandshakeHandler(handshakeHandler)
      .setAllowedOrigins("*")
  }
}

class CookiesInterceptor extends HandshakeInterceptor {
  override def beforeHandshake(request: ServerHttpRequest,
                               response: ServerHttpResponse,
                               handler: WebSocketHandler,
                               attributes: util.Map[String, AnyRef]): Boolean = {
    request match {
      case servletServerHttpRequest: ServletServerHttpRequest =>
        val servletRequest = servletServerHttpRequest.getServletRequest

        for {
          cookie <- Option(servletRequest.getCookies).getOrElse(Array.empty)
        } attributes.put(cookie.getName, cookie.getValue)

      case _ =>
    }

    true
  }

  override def afterHandshake(serverHttpRequest: ServerHttpRequest,
                              serverHttpResponse: ServerHttpResponse,
                              webSocketHandler: WebSocketHandler,
                              e: Exception): Unit = {

  }
}
