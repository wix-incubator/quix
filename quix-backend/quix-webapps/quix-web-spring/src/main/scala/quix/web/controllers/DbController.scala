package quix.web.controllers

import monix.execution.Scheduler
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation._
import quix.api.db.Db

import scala.concurrent.Await
import scala.concurrent.duration.FiniteDuration

@Controller
@RequestMapping(Array("/api"))
class DbController(db: Db, requestTimeout: FiniteDuration) {

  @CrossOrigin(origins = Array("*"), allowedHeaders = Array("*"))
  @RequestMapping(value = Array("/db/explore"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getCatalogsNoColumns = {
    Await.result(db.catalogs.runToFuture(Scheduler.global), requestTimeout)
  }

  @CrossOrigin(origins = Array("*"), allowedHeaders = Array("*"))
  @RequestMapping(value = Array("/db/explore/{catalog}/{schema}/{table}"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getTable(@PathVariable catalog: String, @PathVariable schema: String, @PathVariable table: String) = {
    Await.result(db.table(catalog, schema, table).runToFuture(Scheduler.global), requestTimeout)
  }

  @CrossOrigin(origins = Array("*"), allowedHeaders = Array("*"))
  @RequestMapping(value = Array("/db/autocomplete"), method = Array(RequestMethod.GET))
  @ResponseBody
  def autocomplete() = {
    Await.result(db.autocomplete.runToFuture(Scheduler.global), requestTimeout)
  }
}
