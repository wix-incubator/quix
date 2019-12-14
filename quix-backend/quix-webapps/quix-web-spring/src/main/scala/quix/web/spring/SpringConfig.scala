package quix.web.spring

import java.io.ByteArrayInputStream
import java.nio.file.{Files, Paths}
import java.util.Base64

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper}
import com.google.auth.oauth2.ServiceAccountCredentials
import com.google.cloud.bigquery.BigQueryOptions
import com.typesafe.scalalogging.LazyLogging
import monix.eval.Coeval
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.context.annotation.{Bean, Configuration, DependsOn}
import org.springframework.core.env.Environment
import quix.api.execute.{Batch, DownloadableQueries, ExecutionEvent}
import quix.api.module.ExecutionModule
import quix.api.users.DummyUsers
import quix.athena._
import quix.bigquery._
import quix.bigquery.db.{BigQueryAutocomplete, BigQueryCatalogs, BigQueryTables}
import quix.core.db.{RefreshableAutocomplete, RefreshableCatalogs, RefreshableDb}
import quix.core.download.DownloadableQueriesImpl
import quix.core.executions.SequentialExecutions
import quix.core.utils.JsonOps
import quix.jdbc._
import quix.presto._
import quix.presto.db.{PrestoAutocomplete, PrestoCatalogs, PrestoTables}
import quix.presto.rest.ScalaJPrestoStateClient
import quix.python.{PythonConfig, PythonExecutor, PythonModule}
import quix.web.auth.{DemoUsers, JwtUsers}
import quix.web.controllers.{DbController, DownloadController, HealthController}

import scala.util.control.NonFatal

@SpringBootApplication
@Configuration
class SpringConfig {

}

object Registry {
  val modules = scala.collection.mutable.Map.empty[String, ExecutionModule[String, Batch]]
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

    env.getProperty("demo.mode", "false").toLowerCase match {
      case "true" => new DemoUsers(auth.value)
      case _ => auth.value
    }
  }
}

@Configuration
class ModulesConfiguration extends LazyLogging {

  def getModules(env: Environment, moduleName: String) = {
    val modules = env.getProperty("modules", "").split(",")

    modules.filter { module =>
      env.getProperty(s"modules.$module.engine", "") == moduleName || module == moduleName
    }
  }

  @Bean def initPresto(env: Environment) = {

    def getPrestoModule(presto: String) = {
      val config = {
        def addMissingSlashIfNeeded(endpoint: String) = {
          if (endpoint.endsWith("/")) endpoint
          else endpoint + "/"
        }

        val prestoBaseApi = addMissingSlashIfNeeded {
          env.getProperty(s"modules.$presto.api", env.getProperty("presto.api"))
        }

        val statementsApi = prestoBaseApi + "statement"
        val healthApi = prestoBaseApi + "cluster"
        val queryInfoApi = prestoBaseApi + "query/"

        val defaultCatalog = {
          env.getProperty(s"modules.$presto.catalog", env.getProperty("presto.catalog", "system"))
        }

        val defaultSchema = {
          env.getProperty(s"modules.$presto.schema", env.getProperty("presto.schema", "runtime"))
        }

        val defaultSource = {
          env.getProperty(s"modules.$presto.source", env.getProperty("presto.source", "quix"))
        }

        PrestoConfig(statementsApi, healthApi, queryInfoApi, defaultSchema, defaultCatalog, defaultSource)
      }

      val client = new ScalaJPrestoStateClient(config)
      val executor = new QueryExecutor(client)
      val executions = new SequentialExecutions[String](executor)

      val db = {

        val emptyDbTimeout = {
          env.getProperty(s"modules.$presto.db.empty.timeout", classOf[Long],
            env.getProperty("presto.db.empty.timeout", classOf[Long], 1000L * 10))
        }

        val requestTimeout = {
          env.getProperty(s"modules.$presto.db.request.timeout", classOf[Long],
            env.getProperty("presto.db.request.timeout", classOf[Long], 5000L))
        }

        logger.info(s"event=[spring-config] bean=[RefreshableDbConfig] firstEmptyStateDelay=$emptyDbTimeout requestTimeout=$requestTimeout")

        val prestoCatalogs = new PrestoCatalogs(executor)
        val catalogs = new RefreshableCatalogs(prestoCatalogs, emptyDbTimeout, 1000L * 60 * 5)
        val autocomplete = new RefreshableAutocomplete(new PrestoAutocomplete(prestoCatalogs, executor), emptyDbTimeout, 1000L * 60 * 5)
        val tables = new PrestoTables(executor, requestTimeout)

        new RefreshableDb(catalogs, autocomplete, tables)
      }

      new PrestoQuixModule(executions, Some(db))
    }

    for (module <- getModules(env, "presto"))
      Registry.modules.update(module, getPrestoModule(module))

    "OK"
  }

  @Bean def initAthena(env: Environment) = {
    def getAthenaModule(athena: String) = {
      val config = {
        val output = env.getProperty(s"modules.$athena.output",
          env.getProperty("athena.output", ""))

        val region = env.getProperty(s"modules.$athena.region",
          env.getProperty("athena.region", ""))

        val database = env.getProperty(s"modules.$athena.database",
          env.getProperty("athena.database", ""))

        val firstEmptyStateDelay = env.getProperty(s"modules.$athena.db.empty.timeout", classOf[Long], 1000L * 10)
        val requestTimeout = env.getProperty(s"modules.$athena.db.request.timeout", classOf[Long], 5000L)

        val awsAccessKeyId = env.getProperty(s"modules.$athena.aws.access.key.id",
          env.getProperty("aws.access.key.id"))
        val awsSecretKey = env.getProperty(s"modules.$athena.aws.secret.key",
          env.getProperty("aws.secret.key"))

        AthenaConfig(output, region, database, firstEmptyStateDelay, requestTimeout, awsAccessKeyId, awsSecretKey)
      }

      logger.warn(s"event=[spring-config] bean=[AthenaConfig] config=$config")

      val executor = AthenaQueryExecutor(config)

      val athenaCatalogs = new AthenaCatalogs(executor)
      val catalogs = new RefreshableCatalogs(athenaCatalogs, config.firstEmptyStateDelay, 1000L * 60 * 5)
      val autocomplete = new RefreshableAutocomplete(new AthenaAutocomplete(athenaCatalogs), config.firstEmptyStateDelay, 1000L * 60 * 5)
      val tables = new AthenaTables(executor)

      val db = new RefreshableDb(catalogs, autocomplete, tables)

      AthenaQuixModule(executor, db)
    }

    for (module <- getModules(env, "athena"))
      Registry.modules.update(module, getAthenaModule(module))

    "OK"
  }

  @Bean def initBigQuery(env: Environment) = {
    def getBigQueryModule(bigquery: String) = {
      val config = {
        val credentialsBase64 = env.getProperty(s"modules.$bigquery.credentials.base64")
        val credentialsFile = env.getProperty(s"modules.$bigquery.credentials.file")

        val credentials = if (credentialsBase64 != null && credentialsBase64.nonEmpty) {
          Base64.getDecoder.decode(credentialsBase64.getBytes("UTF-8"))
        } else if (credentialsFile != null && credentialsFile.nonEmpty && Files.exists(Paths.get(credentialsFile))) {
          Files.readAllBytes(Paths.get(credentialsFile))
        } else throw new IllegalArgumentException("Missing BigQuery credentials data")

        BigQueryConfig(
          credentials,
          firstEmptyStateDelay = env.getProperty(s"modules.$bigquery.db.empty.timeout", classOf[Long], 1000L * 10),
          requestTimeout = env.getProperty(s"modules.$bigquery.db.request.timeout", classOf[Long], 5000L)
        )
      }

      logger.warn(s"event=[spring-config] bean=[BigQueryConfig] config=$config")

      val executor = BigQueryQueryExecutor(config)

      val credentials = ServiceAccountCredentials.fromStream(new ByteArrayInputStream(config.credentialBytes))

      val bigQuery = BigQueryOptions
        .newBuilder()
        .setCredentials(credentials)
        .build()
        .getService

      val bigQueryCatalogs = new BigQueryCatalogs(config, bigQuery)
      val catalogs = new RefreshableCatalogs(bigQueryCatalogs, config.requestTimeout, config.firstEmptyStateDelay)
      val autocomplete = new RefreshableAutocomplete(new BigQueryAutocomplete(bigQueryCatalogs, executor), config.requestTimeout, config.firstEmptyStateDelay)
      val tables = new BigQueryTables(executor, config.requestTimeout)

      val db = new RefreshableDb(catalogs, autocomplete, tables)

      BigQueryQuixModule(executor, db)
    }

    for (module <- getModules(env, "bigquery"))
      Registry.modules.update(module, getBigQueryModule(module))

    "OK"
  }

  @Bean def initJdbc(env: Environment): String = {
    for (module <- getModules(env, "jdbc")) {
      val url = env.getRequiredProperty(s"modules.$module.url")
      val user = env.getRequiredProperty(s"modules.$module.user")
      val pass = env.getRequiredProperty(s"modules.$module.pass")
      val driver = env.getRequiredProperty(s"modules.$module.driver")

      val emptyDbTimeout = {
        env.getProperty(s"modules.$module.db.empty.timeout", classOf[Long],
          env.getProperty("presto.db.empty.timeout", classOf[Long], 1000L * 10))
      }

      try {
        Class.forName(driver)
      } catch {
        case NonFatal(e) =>
          logger.error(s"event=[spring-error] message=[failed-to-load-class] class=[$driver]", e)
      }

      val config = JdbcConfig(url, user, pass, driver)
      val executor = new JdbcQueryExecutor(config)
      val jdbcCatalogs = new JdbcCatalogs(config)
      val tables = new JdbcTables(config)
      val jdbcAutocomplete = new JdbcAutocomplete(jdbcCatalogs)

      val catalogs = new RefreshableCatalogs(jdbcCatalogs, emptyDbTimeout, 1000L * 60 * 5)
      val autocomplete = new RefreshableAutocomplete(jdbcAutocomplete, emptyDbTimeout, 1000L * 60 * 5)
      val db = new RefreshableDb(catalogs, autocomplete, tables)

      Registry.modules.update(module, JdbcQuixModule(executor, db))
    }

    "OK"
  }

  @Bean def initPython(env: Environment): String = {
    for (moduleName <- getModules(env, "python")) {
      val module = {

        val config = {
          val indexUrl = env.getProperty(s"modules.$moduleName.pip.index", "https://pypi.python.org/simple")
          val extraIndexUrl = env.getProperty(s"modules.$moduleName.pip.extra.index", "")
          val packages = env.getProperty(s"modules.$moduleName.pip.packages", "").split(",").map(_.trim).filter(_.nonEmpty)
          val userScriptsDir = env.getProperty(s"modules.$moduleName.scripts.dir", "/tmp/quix-python")
          val additionalCodeFile = env.getProperty(s"modules.$moduleName.additional.code.file", "/tmp/quix-python/code.py")
          val additionalCode = {
            val file = Paths.get(additionalCodeFile)
            if (Files.exists(file)) "\n\n" + new String(Files.readAllBytes(file), "UTF-8") + "\n\n"
            else ""
          }

          PythonConfig(indexUrl, extraIndexUrl, packages, userScriptsDir, additionalCode)
        }

        val executor = new PythonExecutor(config)
        new PythonModule(executor)
      }
      Registry.modules.update(moduleName, module)
    }

    "OK"
  }

  @Bean
  @DependsOn(Array("initPresto", "initAthena", "initJdbc", "initBigQuery", "initPython"))
  def initKnownModules: Map[String, ExecutionModule[String, Batch]] = {
    logger.info(s"*******************************************************")
    logger.info(s"****************          Modules are")
    Registry.modules.keySet.toList.sorted.foreach { module =>
      logger.info(s"****************          $module")
    }
    logger.info(s"*******************************************************")

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
