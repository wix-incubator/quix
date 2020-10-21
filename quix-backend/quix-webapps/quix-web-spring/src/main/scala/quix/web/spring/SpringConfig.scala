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
import quix.api.v1.execute.Batch
import quix.api.v2.execute.ExecutionModule
import quix.api.v1.users.DummyUsers
import quix.athena._
import quix.bigquery._
import quix.bigquery.db.{BigQueryAutocomplete, BigQueryCatalogs, BigQueryTables}
import quix.core.db.{RefreshableAutocomplete, RefreshableCatalogs, RefreshableDb}
import quix.core.download.{DownloadConfig, QueryResultsStorage}
import quix.core.executions.{SqlModule}
import quix.core.history.dao.HistoryReadDao
import quix.core.sql.StopWordSqlSplitter
import quix.core.utils.JsonOps
import quix.jdbc._
import quix.presto._
import quix.presto.db.{PrestoAutocomplete, PrestoCatalogs, PrestoTables}
import quix.presto.rest.ScalaJPrestoStateClient
import quix.python.{PythonConfig, PythonExecutor, PythonModule}
import quix.web.auth.{DemoUsers, JwtUsers}
import quix.web.controllers.{DbController, DownloadController, HealthController, HistoryController}

import scala.util.control.NonFatal

@SpringBootApplication
@Configuration
class SpringConfig {

}

object Registry {
  val modules = scala.collection.mutable.Map.empty[String, ExecutionModule]
}

@Configuration
class AuthConfig extends LazyLogging {

  @Bean def initUsers(env: Environment) = {
    logger.info("event=[spring-config] bean=[Users]")

    val authType = Coeval(env.getRequiredProperty("auth.type"))
    val dummyUsers = new DummyUsers(env.getProperty("auth.user", "dummy-user"))

    val auth = authType.map {
      case "fake" =>
        logger.info(s"event=init-users-fake")
        dummyUsers

      case "google" =>
        logger.info(s"event=init-users-google")
        val cookie = env.getRequiredProperty("auth.cookie")
        val secret = env.getRequiredProperty("auth.secret")

        require(cookie.nonEmpty, "auth.cookie can't be an empty string")
        require(secret.nonEmpty, "auth.secret can't be an empty string")

        new JwtUsers(cookie, secret)

      case unknown =>
        logger.warn(s"event=init-users-failure reason=unknown-auth-type auth-type=$unknown")
        dummyUsers
    }.onErrorRecoverWith { case NonFatal(e) =>
      logger.warn(s"event=init-users-failure reason=exception exception=[${e.getMessage}]")
      Coeval(dummyUsers)
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

      val db = new RefreshableDb(catalogs, autocomplete, tables)

      new SqlModule(executor, Some(db))
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

      new SqlModule(executor, Some(db))
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

      new SqlModule(executor, Some(db), new StopWordSqlSplitter("TEMP", "FUNCTION"))
    }

    for (module <- getModules(env, "bigquery"))
      Registry.modules.update(module, getBigQueryModule(module))

    "OK"
  }

  @Bean def initJdbc(env: Environment): String = {
    def getJdbcModule(module: String): SqlModule = {
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

      new SqlModule(executor, Option(db))
    }

    for (module <- getModules(env, "jdbc")) {
      Registry.modules.update(module, getJdbcModule(module))
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
  def initKnownModules: Map[String, ExecutionModule] = {
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

  @Bean def initDownloadConfig(env: Environment): DownloadConfig = {
    val downloadsDir = env.getProperty(s"downloads.temp.dir", "/tmp/quix/downloads")

    val cloud = env.getProperty("downloads.cloud.storage", "none")

    val cloudConfig = cloud match {
      case "s3" =>
        Map(
          "bucket" -> env.getRequiredProperty("download.s3.bucket"),
          "region" -> env.getRequiredProperty("download.s3.region"),
          "accessKey" -> env.getRequiredProperty("download.s3.access"),
          "secretKey" -> env.getRequiredProperty("download.s3.secret"),
        )

      case _ =>
        Map.empty[String, String]
    }

    DownloadConfig(downloadsDir, cloudConfig)
  }

  @Bean def initQueryResultsStorage(downloadConfig: DownloadConfig): QueryResultsStorage = {
    logger.info(s"event=[spring-config] bean=[QueryResultsStorage]")

    QueryResultsStorage(downloadConfig)
  }
}

@Configuration
class Controllers extends LazyLogging {

  @Bean def initDbController(modules: Map[String, ExecutionModule]): DbController = {
    logger.info("event=[spring-config] bean=[DbController]")
    new DbController(modules)
  }

  @Bean def initDownloadController(queryResultsStorage: QueryResultsStorage): DownloadController = {
    logger.info("event=[spring-config] bean=[DownloadController]")
    new DownloadController(queryResultsStorage)
  }

  @Bean def initHistoryController(historyReadDao: HistoryReadDao): HistoryController = {
    logger.info("event=[spring-config] bean=[HistoryController]")
    new HistoryController(historyReadDao)
  }

  @Bean def initHealthController: HealthController = {
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
