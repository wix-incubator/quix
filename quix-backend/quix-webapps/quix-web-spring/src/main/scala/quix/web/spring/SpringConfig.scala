package quix.web.spring

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper}
import com.typesafe.scalalogging.LazyLogging
import monix.eval.Coeval
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.context.annotation.{Bean, Configuration, DependsOn}
import org.springframework.core.env.Environment
import quix.api.execute.{Batch, DownloadableQueries, ExecutionEvent}
import quix.api.module.ExecutionModule
import quix.api.users.DummyUsers
import quix.athena.{AthenaConfig, AthenaDb, AthenaQueryExecutor, AthenaQuixModule}
import quix.core.download.DownloadableQueriesImpl
import quix.core.executions.SequentialExecutions
import quix.core.utils.JsonOps
import quix.presto._
import quix.presto.db.{PrestoRefreshableDb, RefreshableDbConfig}
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
class ModulesConfiguration extends LazyLogging {

  object Registry {
    val modules = scala.collection.mutable.Map.empty[String, ExecutionModule[String, Batch]]
  }

  @Bean def initPresto(env: Environment) = {
    val modules = env.getProperty("modules", "").split(",")

    if (modules.contains("presto")) {
      val config = {
        def addMissingSlashIfNeeded(endpoint: String) = {
          if (endpoint.endsWith("/")) endpoint
          else endpoint + "/"
        }

        val prestoBaseApi = addMissingSlashIfNeeded(env.getRequiredProperty("presto.api"))

        val statementsApi = prestoBaseApi + "statement"
        val healthApi = prestoBaseApi + "cluster"
        val queryInfoApi = prestoBaseApi + "query/"

        val defaultCatalog = env.getProperty("presto.catalog", "system")
        val defaultSchema = env.getProperty("presto.schema", "runtime")
        val defaultSource = env.getProperty("presto.source", "quix")

        PrestoConfig(statementsApi, healthApi, queryInfoApi, defaultSchema, defaultCatalog, defaultSource)
      }

      val client = new ScalaJPrestoStateClient(config)
      val executor = new QueryExecutor(client)
      val executions = new SequentialExecutions[String](executor)

      val db = {
        import scala.concurrent.duration._

        val firstEmptyStateDelay = env.getProperty("presto.db.empty.timeout", classOf[Long], 1000L * 10)
        val requestTimeout = env.getProperty("presto.db.request.timeout", classOf[Long], 5000L)

        logger.info(s"event=[spring-config] bean=[RefreshableDbConfig] firstEmptyStateDelay=$firstEmptyStateDelay requestTimeout=$requestTimeout")

        new PrestoRefreshableDb(executor, RefreshableDbConfig(firstEmptyStateDelay.millis, requestTimeout.millis))
      }

      val module = new PrestoQuixModule(executions, Some(db))

      Registry.modules.update("presto", module)
    }

    "OK"
  }

  @Bean def initAthena(env: Environment) = {
    val modules = env.getProperty("modules", "").split(",")

    if (modules.contains("athena")) {

      val config = {
        val output = env.getRequiredProperty("athena.output")
        val region = env.getRequiredProperty("athena.region")
        val database = env.getProperty("athena.database", "")

        val firstEmptyStateDelay = env.getProperty("athena.db.empty.timeout", classOf[Long], 1000L * 10)
        val requestTimeout = env.getProperty("athena.db.request.timeout", classOf[Long], 5000L)

        AthenaConfig(output, region, database, firstEmptyStateDelay, requestTimeout)
      }

      logger.warn(s"event=[spring-config] bean=[AthenaConfig] config==$config")

      val executor = AthenaQueryExecutor(config)
      val db = new AthenaDb(executor, config)

      Registry.modules.update("athena", AthenaQuixModule(executor, db))
    }

    "OK"
  }

  @Bean
  @DependsOn(Array("initPresto", "initAthena"))
  def initKnownModules: Map[String, ExecutionModule[String, Batch]] = {
    logger.info(s"event=[spring-config] bean=[initKnownModules] modules=[${Registry.modules.keySet.toList.sorted}]")

    Registry.modules.toMap
  }
}

@Configuration
class DownloadConfiguration extends LazyLogging {

  @Bean def initDownloadableQueries: DownloadableQueries[String, Batch, ExecutionEvent] = {
    logger.info(s"event=[spring-config] bean=[DownloadableQueries]")
    new DownloadableQueriesImpl
  }
}

@Configuration
class Controllers extends LazyLogging {

  @Bean def initDbController(modules: Map[String, ExecutionModule[String, Batch]]) = {
    logger.info("event=[spring-config] bean=[DbController]")
    new DbController(modules)
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

@Configuration class JacksonConfiguration {
  @Bean def objectMapper: ObjectMapper = {
    val mapper = JsonOps.global
    mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
    mapper
  }
}