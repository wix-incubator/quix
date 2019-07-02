package quix.jdbc

import java.util.UUID

import com.mysql.jdbc.jdbc2.optional.MysqlDataSource
import com.wix.mysql.EmbeddedMysql
import com.wix.mysql.EmbeddedMysql.anEmbeddedMysql
import com.wix.mysql.ScriptResolver.classPathScript
import com.wix.mysql.config.Charset.UTF8
import com.wix.mysql.config.MysqldConfig
import com.wix.mysql.config.MysqldConfig.aMysqldConfig
import com.wix.mysql.distribution.Version.v5_6_23
import monix.execution.Scheduler
import org.specs2.mock.Mockito
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.Scope
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.transaction.annotation.{Propagation, Transactional}
import quix.api.execute.{ActiveQuery, Batch, BatchColumn}
import quix.api.users.User
import quix.core.results.SingleBuilder

import scala.concurrent.duration._


@Transactional(propagation = Propagation.NOT_SUPPORTED)
class JdbcExecutionsTest extends SpecWithJUnit with Mockito {
  sequential

  "JdbcQueryExecutor" should {
    "call builder.start & builder.end on zero queries" in new ctx {

      val queryId = UUID.randomUUID().toString
      val query = ActiveQuery(queryId, Seq("select 1"), User("user@quix"))
      queryExecutor.runTask(query = query, builder = builder).runToFuture(scheduler)

      eventually {
        there was one(builder).start(query)
        there was one(builder).end(query)


      }

      sql.stop()

    }

    "call builder with query result" in new ctx {

      val queryId = UUID.randomUUID().toString
      val queryData = ActiveQuery(queryId, Seq("select * from t1"), User("user@quix"))
      queryExecutor.runTask(query = queryData, builder = builder).runToFuture(scheduler)
      val value1: AnyRef = Int. box(10)
      val value2: AnyRef = "zzz"
      eventually {
        there was one(builder).addSubQuery("1" , Batch(List(List(List(value1, value2))), Some(List(BatchColumn("col1"),BatchColumn("col2")))))

      }

      sql.stop()
    }
  }


  class ctx extends Scope {

    val builder = spy(new SingleBuilder[String])
    val scheduler = Scheduler.global
    val testDelay = 0.seconds

    val config: MysqldConfig = aMysqldConfig(v5_6_23)
      .withCharset(UTF8)
      .withPort(2215)
      .withUser("wix", "wix")
      .build()


    val mysqld: EmbeddedMysql.Builder = anEmbeddedMysql(config)
      .addSchema("aschema", classPathScript("db/001_init.sql"))

    val sql  = mysqld.start()

    val jdbcTemplate = new NamedParameterJdbcTemplate(
      MyDataSourceFactory.getMySQLDataSource)


    val queryExecutor = new JdbcQueryExecutor(
      jdbcTemplate,
      testDelay
    )


  }


}

import java.io.IOException


object MyDataSourceFactory {
  def getMySQLDataSource: MysqlDataSource = {
    var mysqlDS = new MysqlDataSource()
    try {
      mysqlDS.setURL(s"jdbc:mysql://localhost:2215/aschema?zeroDateTimeBehavior=CONVERT_TO_NULL")
      mysqlDS.setUser("wix")
      mysqlDS.setPassword("wix")
    } catch {
      case e: IOException =>
        e.printStackTrace()
    }
    mysqlDS
  }
}