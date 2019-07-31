package quix.jdbc

import monix.execution.Scheduler.Implicits.global
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.{AfterAll, BeforeAll, BeforeEach, Scope}

class MysqlJdbcTablesTest extends SpecWithJUnit with BeforeAll with BeforeEach with AfterAll {
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

  "JdbcTables.fast" should {
    "return table on valid request of single column table" in new ctx {
      val table = tables.get("__root", "aschema", "small_table").runSyncUnsafe()
      val columns = table.children.map(_.name)

      table.name must_=== "small_table"
      columns must contain("col1")
    }

    "return table with empty columns on bad request" in new ctx {
      val table = tables.get("foo", "bar", "baz").runSyncUnsafe()

      table.name must_=== "baz"
      table.children must beEmpty
    }

    "return all columns on valid request of wide table" in new ctx {
      val table = tables.get("__root", "aschema", "wide_table").runSyncUnsafe()
      val columns = table.children.map(_.name)

      val expected = (1 to 10).map(i => "col" + i).toList

      columns must_=== expected
    }
  }
}
