package quix.jdbc

import java.util.UUID

import com.typesafe.scalalogging.LazyLogging
import com.wix.mysql.EmbeddedMysql.anEmbeddedMysql
import com.wix.mysql.ScriptResolver.classPathScript
import com.wix.mysql.config.Charset.UTF8
import com.wix.mysql.config.MysqldConfig
import com.wix.mysql.config.MysqldConfig.aMysqldConfig
import com.wix.mysql.distribution.Version.v5_6_23
import monix.execution.Scheduler.Implicits.global
import org.specs2.mock.Mockito
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.{AfterAll, BeforeEach, Scope}
import quix.api.execute.{ActiveQuery, Batch}
import quix.api.users.User
import quix.core.results.SingleBuilder

class JdbcQueryExecutorTest extends SpecWithJUnit with BeforeEach with AfterAll with Mockito {
  sequential

  class ctx extends Scope {
    val config =
      JdbcConfig("jdbc:mysql://localhost:2215/aschema", "wix", "wix", "com.mysql.cj.jdbc.Driver", batchSize = 1)
    val executor = new JdbcQueryExecutor(config)
    Class.forName(config.driver)

    val builder = spy(new SingleBuilder[String])

    def query(sql: String) = ActiveQuery(UUID.randomUUID().toString, Seq(sql), User("user@quix"))
  }

  override def before = EmbededDb.reloadSchema

  def afterAll() = EmbededDb.stop

  "JdbcQueryExecutor" should {

    "call builder.startSubQuery & builder.endSubQuery on valid" in new ctx {
      val sql = query("select * from small_table")
      executor.runTask(sql, builder).runSyncUnsafe()

      // verify
      there was one(builder).startSubQuery(anyString, anyString, any[Batch]())

      there was one(builder).addSubQuery(anyString, any[Batch]())

      there was one(builder).endSubQuery(anyString)
    }

    "do not call builder.addSubQuery on zero results" in new ctx {
      val sql = query("select * from empty_table")
      executor.runTask(sql, builder).runSyncUnsafe()

      // verify
      there was one(builder).startSubQuery(anyString, anyString, any[Batch]())

      there was no(builder).addSubQuery(anyString, any[Batch]())

      there was one(builder).endSubQuery(anyString)
    }

    "stop query if query.isCancelled is true" in new ctx {
      val sql = query("select * from large_table").copy(isCancelled = true)
      executor.runTask(sql, builder).runSyncUnsafe()

      // verify
      there was one(builder).startSubQuery(anyString, anyString, any[Batch]())

      there was no(builder).addSubQuery(anyString, any[Batch]())

      there was one(builder).endSubQuery(anyString)
    }

    "call builder.error on connection errors" in new ctx {
      EmbededDb.stop
      val sql = query("select * from empty_table")
      executor.runTask(sql, builder).runSyncUnsafe()

      // verify
      there was one(builder).errorSubQuery(anyString, any[Throwable]())
    }
  }
}

object EmbededDb extends LazyLogging {
  val config: MysqldConfig = aMysqldConfig(v5_6_23)
    .withCharset(UTF8)
    .withPort(2215)
    .withUser("wix", "wix")
    .build()

  var db = anEmbeddedMysql(config)
    .addSchema("aschema", classPathScript("db/001_init.sql"))
    .start()

  def reloadSchema = {
    logger.info("method=reloadSchema")
    db.reloadSchema("aschema", classPathScript("db/001_init.sql"))
  }

  def stop = {
    logger.info("method=stop")
    db.stop()
  }
}
