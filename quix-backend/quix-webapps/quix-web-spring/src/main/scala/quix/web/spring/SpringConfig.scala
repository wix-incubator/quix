package quix.web.spring

import java.util.concurrent.TimeUnit

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper}
import com.typesafe.scalalogging.LazyLogging
import monix.eval.Coeval
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.context.annotation.{Bean, Configuration}
import org.springframework.core.env.Environment
import quix.api.db.Db
import quix.api.execute.{AsyncQueryExecutor, Batch, DownloadableQueries, ExecutionEvent}
import quix.api.users.DummyUsers
import quix.core.download.DownloadableQueriesImpl
import quix.core.executions.SequentialExecutions
import quix.core.utils.JsonOps
import quix.presto._
import quix.presto.db.{RefreshableDb, RefreshableDbConfig}
import quix.presto.rest.ScalaJPrestoStateClient
import quix.web.auth.JwtUsers
import quix.web.controllers.{DbController, DownloadController, HealthController}

import scala.util.control.NonFatal

@SpringBootApplication
@Configuration
class SpringConfig {

}

@Configuration
class AuthConfig extends LazyLogging {

  @Bean def initUsers(env: Environment) = {
    logger.info("event=[spring-config] bean=[Users]")

    val authType = Coeval(env.getRequiredProperty("auth.type"))

    val auth = authType.map {
      case "fake" =>
        logger.info(s"event=init-users-fake")
        DummyUsers

      case "google" =>
        logger.info(s"event=init-users-google")
        val cookie = env.getRequiredProperty("auth.cookie")
        val secret = env.getRequiredProperty("auth.secret")

        require(cookie.nonEmpty, "auth.cookie can't be an empty string")
        require(secret.nonEmpty, "auth.secret can't be an empty string")

        new JwtUsers(cookie, secret)

      case unknown =>
        logger.warn(s"event=init-users-failure reason=unknown-auth-type auth-type=$unknown")
        DummyUsers
    }.onErrorRecoverWith { case NonFatal(e) =>
      logger.warn(s"event=init-users-failure reason=exception exception=[${e.getMessage}]")
      Coeval(DummyUsers)
    }

    auth.value
  }
}

@Configuration
class PrestoConfiguration extends LazyLogging {

  def addMissingSlashIfNeeded(endpoint: String) = {
    if (endpoint.endsWith("/")) endpoint
    else endpoint + "/"
  }

  @Bean def initPrestoConfig(env: Environment): PrestoConfig = {
    val prestoBaseApi = addMissingSlashIfNeeded(env.getRequiredProperty("presto.api"))

    val statementsApi = prestoBaseApi + "statement"
    val healthApi = prestoBaseApi + "cluster"
    val queryInfoApi = prestoBaseApi + "query/"

    val defaultCatalog = env.getProperty("presto.defaultCatalog", "system")
    val defaultSchema = env.getProperty("presto.defaultSchema", "runtime")
    val defaultSource = env.getProperty("presto.defaultSource", "quix")

    val config = PrestoConfig(statementsApi, healthApi, queryInfoApi, defaultSchema, defaultCatalog, defaultSource)

    logger.warn(s"event=[spring-config] bean=[PrestoConfig] presto.api=$prestoBaseApi")

    config
  }

  @Bean def initQueryExecutor(config: PrestoConfig): AsyncQueryExecutor[String, Batch] = {
    logger.info("event=[spring-config] bean=[QueryExecutor]")

    val prestoClient = new ScalaJPrestoStateClient(config)
    new QueryExecutor(prestoClient)
  }

  @Bean def initPrestoExecutions(executor: AsyncQueryExecutor[String, Batch]): SequentialExecutions[String] = {
    logger.info("event=[spring-config] bean=[PrestoExecutions]")

    new SequentialExecutions[String](executor)
  }

  @Bean def initPrestoQuixModule(executions: SequentialExecutions[String]): PrestoQuixModule = {
    logger.info(s"event=[spring-config] bean=[PrestoQuixModule]")
    new PrestoQuixModule(executions)
  }

  @Bean def initDownloadableQueries: DownloadableQueries[String, Batch, ExecutionEvent] = {
    logger.info(s"event=[spring-config] bean=[DownloadableQueries]")
    new DownloadableQueriesImpl
  }
}

@Configuration
class Controllers extends LazyLogging {


  @Bean def initDbController(db: Db, config: RefreshableDbConfig) = {
    logger.info("event=[spring-config] bean=[DbController]")
    new DbController(db, config.requestTimeout)
  }

  @Bean def initDownloadController(downloadableQueries: DownloadableQueries[String, Batch, ExecutionEvent]): DownloadController = {
    logger.info("event=[spring-config] bean=[DownloadController]")
    new DownloadController(downloadableQueries)
  }

  @Bean def initHealthController() = {
    logger.info("event=[spring-config] bean=[HealthController]")
    new HealthController
  }
}

@Configuration
class DbConfig extends LazyLogging {

  import scala.concurrent.duration._

  @Bean def initRefreshableDbConfig(env: Environment): RefreshableDbConfig = {
    val firstEmptyStateDelay = env.getProperty("db.state.firstDelayInMillis", classOf[Long], 1000L * 10)
    val requestTimeout = env.getProperty("db.state.requestDelayInMillis", classOf[Long], 5000L)

    logger.info(s"event=[spring-config] bean=[RefreshableDbConfig] firstEmptyStateDelay=$firstEmptyStateDelay requestTimeout=$requestTimeout")

    RefreshableDbConfig(firstEmptyStateDelay.millis, requestTimeout.millis)
  }

  @Bean def initDb(env: Environment, executor: AsyncQueryExecutor[String, Batch], config: RefreshableDbConfig): Db = {
    val initialDelay = env.getProperty("db.refresh.initialDelayInMinutes", classOf[Long], 1L)
    val delay = env.getProperty("db.refresh.delayInMinutes", classOf[Long], 15L)

    val db = new RefreshableDb(executor, config)

    logger.info(s"event=[spring-config] bean=[DbController] initial-delay=$initialDelay delay=$delay")

    db.scheduleChore(initialDelay, delay, TimeUnit.MINUTES)

    db
  }
}

@Configuration class JacksonConfiguration {
  @Bean def objectMapper: ObjectMapper = {
    val mapper = JsonOps.global
    mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
    mapper
  }
}