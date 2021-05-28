package quix.web.controllers

import com.typesafe.scalalogging.LazyLogging
import com.wix.mysql.ScriptResolver.classPathScript
import quix.web.E2EContext

class HistoryControllerTest extends E2EContext with LazyLogging {

  private val prod = EmbeddedMySql.create(4444, "prod-user", "prod-pass").start()

  override def before: Unit = prod.reloadSchema("aschema", classPathScript("db/001_init.sql"))

  override def after = prod.stop()

  "HistoryController" should {
    "listExecutionsHistory" in {
      val query = "select * from small_table"
      execute(query, module = "presto-prod")

      val records = get[List[ExecutionDto]]("api/history/executions")

      records.head.query must contain(query)
    }
  }

}
