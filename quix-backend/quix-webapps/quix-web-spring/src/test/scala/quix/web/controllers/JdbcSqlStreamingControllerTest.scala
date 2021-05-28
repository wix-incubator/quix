package quix.web.controllers

import com.wix.mysql.ScriptResolver.classPathScript
import org.specs2.matcher.{JsonMatchers, MustMatchers}
import org.specs2.specification.BeforeAfterAll
import quix.web.E2EContext

class JdbcSqlStreamingControllerTest extends E2EContext with MustMatchers with JsonMatchers with BeforeAfterAll {

  private val prod = EmbeddedMySql.create(2222, "prod-user", "prod-pass").start()
  private val dev = EmbeddedMySql.create(3333, "dev-user", "dev-pass").start()

  override def beforeAll(): Unit = {
    try {
      prod.reloadSchema("aschema", classPathScript("db/001_init.sql"))
    } catch {
      case _: Throwable =>
    }

    try {
      dev.reloadSchema("aschema", classPathScript("db/001_init.sql"))
    } catch {
      case _: Throwable =>
    }
  }

  override def afterAll(): Unit = {
    prod.stop()
    dev.stop()
  }

  "JdbcSqlStreamingController" should {
    "prod pass sanity" in {
      val listener = execute("select * from small_table", module = "prod")

      listener.messages must containEvent("""{"event":"start","data":{"id":"query-id","numOfQueries":1}}""")
      listener.messages must containEvent("""{"event":"query-start","data":{"id":"query-id"}}""")
      listener.messages must containEvent("""{"event":"query-details","data":{"id":"query-id","code":"select * from small_table"}}""")
      listener.messages must containEvent("""{"event":"fields","data":{"id":"query-id","fields":["col1"]}}""")
      listener.messages must containEvent("""{"event":"row","data":{"id":"query-id","values":[1]}}""")
      listener.messages must containEvent("""{"event":"query-end","data":{"id":"query-id","statistics":{}}}""")
      listener.messages must containEvent("""{"event":"end","data":{"id":"query-id"}}""")
    }

    "dev pass sanity" in {
      val listener = execute("select * from small_table", module = "dev")

      listener.messages must containEvent("""{"event":"start","data":{"id":"query-id","numOfQueries":1}}""")
      listener.messages must containEvent("""{"event":"query-start","data":{"id":"query-id"}}""")
      listener.messages must containEvent("""{"event":"query-details","data":{"id":"query-id","code":"select * from small_table"}}""")
      listener.messages must containEvent("""{"event":"fields","data":{"id":"query-id","fields":["col1"]}}""")
      listener.messages must containEvent("""{"event":"row","data":{"id":"query-id","values":[1]}}""")
      listener.messages must containEvent("""{"event":"query-end","data":{"id":"query-id","statistics":{}}}""")
      listener.messages must containEvent("""{"event":"end","data":{"id":"query-id"}}""")
    }
  }

}