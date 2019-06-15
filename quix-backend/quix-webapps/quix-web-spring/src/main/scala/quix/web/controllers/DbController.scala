package quix.web.controllers

import monix.execution.Scheduler.Implicits.global
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation._
import quix.api.db.Db

import scala.concurrent.duration.FiniteDuration

@Controller
@RequestMapping(Array("/api"))
class DbController(db: Db, requestTimeout: FiniteDuration) {

  @CrossOrigin(origins = Array("*"), allowedHeaders = Array("*"))
  @RequestMapping(value = Array("/db/explore"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getCatalogsNoColumns = {
    db.catalogs.runSyncUnsafe(requestTimeout)
  }

  @CrossOrigin(origins = Array("*"), allowedHeaders = Array("*"))
  @RequestMapping(value = Array("/db/explore/{catalog}/{schema}/{table}"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getTable(@PathVariable catalog: String, @PathVariable schema: String, @PathVariable table: String) = {
    db.table(catalog, schema, table).runSyncUnsafe(requestTimeout)
  }

  @CrossOrigin(origins = Array("*"), allowedHeaders = Array("*"))
  @RequestMapping(value = Array("/db/autocomplete"), method = Array(RequestMethod.GET))
  @ResponseBody
  def autocomplete() = {
    db.autocomplete.runSyncUnsafe(requestTimeout)
  }
}
