package quix.jdbc

import monix.execution.Scheduler.Implicits.global
import monix.execution.atomic.Atomic
import org.specs2.mock.Mockito
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.{AfterAll, BeforeAll, BeforeEach, Scope}
import quix.api.v1.execute.Batch
import quix.api.v1.users.User
import quix.api.v2.execute.ImmutableSubQuery
import quix.core.results.SingleBuilder

class MysqlJdbcQueryExecutorIntegrationTest extends SpecWithJUnit with BeforeAll with BeforeEach with AfterAll with Mockito {
  sequential

  class ctx extends Scope {
    val config =
      JdbcConfig("jdbc:mysql://localhost:2215/aschema", "wix", "wix", "com.mysql.cj.jdbc.Driver", batchSize = 1)
    val executor = new JdbcQueryExecutor(config)
    Class.forName(config.driver)

    val builder = spy(new SingleBuilder)

    def query(sql: String) = ImmutableSubQuery(sql, User("user@quix"))

    val catalogs = new JdbcCatalogs(config)
    val tables = new JdbcTables(config)
  }

  def before = EmbeddedMysqlDb.reloadSchema

  def afterAll() = EmbeddedMysqlDb.stop

  def beforeAll() = EmbeddedMysqlDb.start

  "JdbcQueryExecutor" should {

    "call builder.startSubQuery & builder.endSubQuery on valid" in new ctx {
      val sql = query("select * from small_table")
      executor.execute(sql, builder).runSyncUnsafe()

      // verify
      there was one(builder).startSubQuery(anyString, anyString)

      there was one(builder).addSubQuery(anyString, any[Batch]())

      there was one(builder).endSubQuery(anyString, any())
    }

    "do not call builder.addSubQuery on zero results" in new ctx {
      val sql = query("select * from empty_table")
      executor.execute(sql, builder).runSyncUnsafe()

      // verify
      there was one(builder).startSubQuery(anyString, anyString)

      there was no(builder).addSubQuery(anyString, any[Batch]())

      there was one(builder).endSubQuery(anyString, any())
    }

    "stop query if query.isCancelled is true" in new ctx {
      val sql = query("select * from large_table").copy(canceled = Atomic(true))
      executor.execute(sql, builder).runSyncUnsafe()

      // verify
      there was one(builder).startSubQuery(anyString, anyString)

      there was no(builder).addSubQuery(anyString, any[Batch]())

      there was one(builder).endSubQuery(anyString, any())
    }

    "support create statements" in new ctx {
      val sql = query("create table new_table (col1 INTEGER NOT NULL)")
      executor.execute(sql, builder).runSyncUnsafe()

      // verify
      there was one(builder).startSubQuery(anyString, anyString)

      there was no(builder).addSubQuery(anyString, any[Batch]())

      there was one(builder).endSubQuery(anyString, any())

      there was no(builder).errorSubQuery(anyString, any[Throwable]())
    }

    "support insert statements" in new ctx {
      val sql = query("INSERT INTO small_table values (123);")
      executor.execute(sql, builder).runSyncUnsafe()

      // verify
      there was one(builder).startSubQuery(anyString, anyString)

      there was no(builder).addSubQuery(anyString, any[Batch]())

      there was one(builder).endSubQuery(anyString, any())

      there was no(builder).errorSubQuery(anyString, any[Throwable]())
    }

    "support update statements" in new ctx {
      val sql = query("update small_table set col1 = 123 where col1 = 1")
      executor.execute(sql, builder).runSyncUnsafe()

      // verify
      there was one(builder).startSubQuery(anyString, anyString)

      there was no(builder).addSubQuery(anyString, any[Batch]())

      there was one(builder).endSubQuery(anyString, any())

      there was no(builder).errorSubQuery(anyString, any[Throwable]())
    }

    "support delete statements" in new ctx {
      val sql = query("delete from small_table where col1 = 1")
      executor.execute(sql, builder).runSyncUnsafe()

      // verify
      there was one(builder).startSubQuery(anyString, anyString)

      there was no(builder).addSubQuery(anyString, any[Batch]())

      there was one(builder).endSubQuery(anyString, any())

      there was no(builder).errorSubQuery(anyString, any[Throwable]())
    }

    "call builder.error on connection errors" in new ctx {
      EmbeddedMysqlDb.stop
      val sql = query("select * from empty_table")
      executor.execute(sql, builder).runSyncUnsafe()

      // verify
      there was one(builder).errorSubQuery(anyString, any[Throwable]())

      EmbeddedMysqlDb.start
    }
  }

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
