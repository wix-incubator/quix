package quix.jdbc

import monix.execution.Scheduler.Implicits.global
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.{AfterAll, BeforeAll, BeforeEach, Scope}

class MysqlJdbcTest extends SpecWithJUnit with BeforeAll with BeforeEach with AfterAll {
  sequential

  class ctx extends Scope {
    val config = JdbcConfig("jdbc:mysql://localhost:2215/aschema", "wix", "wix", "com.mysql.cj.jdbc.Driver")
    Class.forName(config.driver)

    val catalogs = new JdbcCatalogs(config)
    val tables = new JdbcTables(config)
  }

  def before = EmbeddedMysqlDb.reloadSchema

  def afterAll() = EmbeddedMysqlDb.stop

  def beforeAll() = EmbeddedMysqlDb.start

  "JdbcCatalogs.fast" should {
    "return only schema names" in new ctx {
      val db = catalogs.fast.runSyncUnsafe()
      val catalogNames = db.map(_.name)
      val schemaNames = db.flatMap(_.children.map(_.name))

      catalogNames must contain("__root")
      schemaNames must contain("aschema")
    }
  }

  "JdbcCatalogs.full" should {
    "return complete db tree" in new ctx {
      val fullTree = catalogs.full.runSyncUnsafe()
      val catalogNames = fullTree.map(_.name)
      val schemaNames = fullTree.flatMap(_.children.map(_.name))
      val tableNames = fullTree.flatMap(_.children.flatMap(_.children.map(_.name)))

      catalogNames must contain("__root")
      schemaNames must contain("aschema")
      tableNames must contain("empty_table", "large_table", "small_table")
    }
  }

}
