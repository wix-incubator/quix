package quix.web.spring

import java.util.concurrent.TimeUnit

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper}
import com.typesafe.scalalogging.LazyLogging
import monix.eval.Coeval
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.context.annotation.{Bean, Configuration}
import org.springframework.core.env.Environment
import quix.api.db.Db
import quix.api.users.DummyUsers
import quix.core.utils.JsonOps
import quix.presto._
import quix.presto.db.RefreshableDb
import quix.presto.rest.ScalaJPrestoStateClient
import quix.web.auth.JwtUsers
import quix.web.controllers.DbController

import scala.util.control.NonFatal

@SpringBootApplication
@Configuration
class SpringConfig {

}

@Configuration
class AuthConfig extends LazyLogging {

  @Bean def initUsers(env: Environment) = {
    logger.info("event=[spring-config] bean=[Users]")

    val auth = Coeval {
      val cookie = env.getRequiredProperty("auth.cookie")
      val secret = env.getRequiredProperty("auth.secret")

      require(cookie.nonEmpty, "auth.cookie can't be an empty string")
      require(secret.nonEmpty, "auth.secret can't be an empty string")

      new JwtUsers(cookie, secret)
    }.onErrorRecoverWith { case NonFatal(e: Exception) =>
      logger.warn("failed to construct secureAuth, falling back to dummy user auth", e)
      Coeval(DummyUsers)
    }

    auth.value
  }
}

@Configuration
class PrestoConfiguration extends LazyLogging {

  @Bean def initPrestoConfig(env: Environment): PrestoConfig = {
    val prestoBaseApi = env.getRequiredProperty("presto.api")

    logger.info(s"Presto API URL is $prestoBaseApi")

    val statementsApi = prestoBaseApi + "/statement"
    val healthApi = prestoBaseApi + "/cluster"
    val queryInfoApi = prestoBaseApi + "/query"

    val defaultSchema = env.getProperty("presto.defaultSchema", "system")
    val defaultCatalog = env.getProperty("presto.defaultCatalog", "runtime")
    val defaultSource = env.getProperty("presto.defaultSource", "nodes")

    val config = PrestoConfig(statementsApi, healthApi, queryInfoApi, defaultSchema, defaultCatalog, defaultSource)

    logger.warn(s"event=[spring-config] bean=[PrestoConfig] presto.api=$prestoBaseApi")

    config
  }

  @Bean def initQueryExecutor(config: PrestoConfig): QueryExecutor = {
    logger.info("event=[spring-config] bean=[QueryExecutor]")

    val prestoClient = new ScalaJPrestoStateClient(config)
    new QueryExecutor(prestoClient)
  }

  @Bean def initPrestoExecutions(executor: QueryExecutor): PrestoExecutions = {
    logger.info("event=[spring-config] bean=[PrestoExecutions]")

    val execution: PrestoExecutions = new PrestoExecutions(executor)

    execution
  }

  @Bean def initPrestoQuixModule(executions: PrestoExecutions): PrestoQuixModule = {
    logger.info(s"event=[spring-config] bean=[PrestoQuixModule]")
    new PrestoQuixModule(executions)
  }
}

@Configuration
class Controllers extends LazyLogging {

  @Bean def initDbController(db: Db) = {
    logger.info("event=[spring-config] bean=[DbController]")
    new DbController(db)
  }
}

@Configuration
class DbConfig extends LazyLogging {

  @Bean def initDb(env: Environment, executor: QueryExecutor) = {
    val initialDelay = env.getProperty("db.refresh.initialDelayInMinutes", classOf[Long], 1L)
    val delay = env.getProperty("db.refresh.delayInMinutes", classOf[Long], 15L)

    val db = new RefreshableDb(executor)

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