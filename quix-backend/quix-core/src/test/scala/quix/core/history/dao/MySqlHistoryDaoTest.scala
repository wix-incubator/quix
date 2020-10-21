package quix.core.history.dao

import java.time.Clock

import cats.effect.Resource
import com.typesafe.scalalogging.LazyLogging
import com.wix.mysql.EmbeddedMysql
import com.wix.mysql.EmbeddedMysql.anEmbeddedMysql
import com.wix.mysql.ScriptResolver.classPathScript
import com.wix.mysql.config.Charset.UTF8
import com.wix.mysql.config.MysqldConfig.aMysqldConfig
import com.wix.mysql.distribution.Version.v5_6_23
import monix.eval.Task
import org.specs2.specification.{AfterAll, BeforeAll, BeforeEach}
import quix.api.v2.execute.{Query => ActiveQuery}
import quix.core.history.Execution

class MySqlHistoryDaoTest
  extends HistoryDaoContractTest
    with BeforeAll
    with BeforeEach
    with AfterAll {

  sequential

  def beforeAll(): Unit = EmbeddedMysqlDb.start()

  def before(): Unit = EmbeddedMysqlDb.reloadSchema()

  def afterAll(): Unit = EmbeddedMysqlDb.stop()

  override def createDao(clock: Clock): Resource[Task, HistoryWriteDao with HistoryReadDao] =
    MySqlHistoryDao.connect(EmbeddedMysqlDb.Config).map { connection =>
      val reader = new MySqlHistoryReadDao(connection)
      val writer = new MySqlHistoryWriteDao(connection, clock)
      new HistoryWriteDao with HistoryReadDao {
        override def executionStarted(query: ActiveQuery, queryType: String): Task[Unit] =
          writer.executionStarted(query, queryType)

        override def executionSucceeded(queryId: String): Task[Unit] =
          writer.executionSucceeded(queryId)

        override def executionFailed(queryId: String, error: Throwable): Task[Unit] =
          writer.executionFailed(queryId, error)

        override def executions(filter: Filter, sort: Sort, page: Page): Task[List[Execution]] =
          reader.executions(filter, sort, page)
      }
    }

}

object EmbeddedMysqlDb extends LazyLogging {
  Class.forName("com.mysql.cj.jdbc.Driver")

  private val port = 2215

  private val user = "wix"

  private val pass = "wix"

  private val schema = "aschema"

  private var db: EmbeddedMysql = _

  val Config = JdbcConfig(s"jdbc:mysql://localhost:$port/$schema", user, pass)

  def reloadSchema(): Unit = {
    logger.info("method=reloadSchema")
    db.reloadSchema(schema, classPathScript("db/001_init.sql"))
  }

  def stop(): Unit = {
    logger.info("method=stop")
    db.stop()
  }

  def start(): Unit = {
    logger.info("method=start")
    db = anEmbeddedMysql(
      aMysqldConfig(v5_6_23)
        .withCharset(UTF8)
        .withPort(port)
        .withUser(user, pass)
        .build())
      .addSchema(schema, classPathScript("db/001_init.sql"))
      .start()
  }
}
