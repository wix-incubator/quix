package quix.web.spring

import java.util

import com.typesafe.scalalogging.LazyLogging
import monix.execution.Scheduler
import org.eclipse.jetty.websocket.api.WebSocketPolicy
import org.springframework.context.annotation.{Bean, Configuration, ImportResource}
import org.springframework.http.server.{ServerHttpRequest, ServerHttpResponse, ServletServerHttpRequest}
import org.springframework.web.socket.WebSocketHandler
import org.springframework.web.socket.server.HandshakeInterceptor
import org.springframework.web.socket.server.jetty.JettyRequestUpgradeStrategy
import org.springframework.web.socket.server.support.DefaultHandshakeHandler
import quix.api.v1.users.Users
import quix.api.v2.execute.ExecutionModule
import quix.core.download.{DownloadConfig, QueryResultsStorage}
import quix.core.history.dao.HistoryWriteDao
import quix.web.controllers.SqlStreamingController

@Configuration
@ImportResource(Array("classpath:websockets.xml"))
class WebsocketsConfig extends LazyLogging {

  @Bean def initSqlStreamingController(users: Users,
                                       modules: Map[String, ExecutionModule],
                                       downloadConfig: DownloadConfig,
                                       queryResultsStorage: QueryResultsStorage,
                                       historyWriteDao: HistoryWriteDao) = {
    logger.info("event=[spring-config] bean=[PrestoController]")
    new SqlStreamingController(
      modules = modules,
      users = users,
      downloadConfig = downloadConfig,
      queryResultsStorage = queryResultsStorage,
      historyWriteDao = historyWriteDao,
      io = Scheduler.io("presto-io"))
  }

  @Bean def initWebSocketPolicy(): WebSocketPolicy = {
    logger.info("event=[spring-config] bean=[WebSocketPolicy]")
    val policy = WebSocketPolicy.newServerPolicy()
    policy.setIdleTimeout(10 * 60 * 1000) // 60 seconds
    policy.setInputBufferSize(8092) // 2 KB
    policy.setMaxTextMessageSize(1024 * 1024) // 1 MB
    policy
  }

  @Bean def initRequestUpgradeStrategyFactory(policy: WebSocketPolicy): JettyRequestUpgradeStrategy = {
    logger.info("event=[spring-config] bean=[JettyRequestUpgradeStrategy]")
    new JettyRequestUpgradeStrategy(policy)
  }

  @Bean def initDefaultHandshakeHandler(requestUpgradeStrategy: JettyRequestUpgradeStrategy): DefaultHandshakeHandler = {
    logger.info("event=[spring-config] bean=[DefaultHandshakeHandler]")
    new DefaultHandshakeHandler(requestUpgradeStrategy)
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
