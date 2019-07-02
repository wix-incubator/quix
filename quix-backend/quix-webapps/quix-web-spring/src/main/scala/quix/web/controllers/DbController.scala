package quix.web.controllers

import monix.execution.Scheduler.Implicits.global
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation._
import quix.api.db.Table
import quix.api.execute.Batch
import quix.api.module.ExecutionModule

import scala.concurrent.duration.{FiniteDuration, _}

@Controller
@RequestMapping(Array("/api"))
class DbController(modules: Map[String, ExecutionModule[String, Batch]], requestTimeout: FiniteDuration = 5.seconds) {

  @CrossOrigin(origins = Array("*"), allowedHeaders = Array("*"))
  @RequestMapping(value = Array("/db/config"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getDbConfig = {
    Map("trees" -> modules.keySet)
  }

  @CrossOrigin(origins = Array("*"), allowedHeaders = Array("*"))
  @RequestMapping(value = Array("/{moduleId}/db/explore"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getCatalogsNoColumns(@PathVariable moduleId: String) = {
    getDb(moduleId).map {
      _.catalogs.runSyncUnsafe(requestTimeout)
    }.getOrElse(Nil)
  }

  @CrossOrigin(origins = Array("*"), allowedHeaders = Array("*"))
  @RequestMapping(value = Array("/{moduleId}/db/explore/{catalog}/{schema}/{table}"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getTable(@PathVariable moduleId: String, @PathVariable catalog: String, @PathVariable schema: String, @PathVariable table: String) = {
    getDb(moduleId).map {
      _.table(catalog, schema, table).runSyncUnsafe(requestTimeout)
    }.getOrElse(Table(table, Nil))
  }

  @CrossOrigin(origins = Array("*"), allowedHeaders = Array("*"))
  @RequestMapping(value = Array("/{moduleId}/db/autocomplete"), method = Array(RequestMethod.GET))
  @ResponseBody
  def autocomplete(@PathVariable moduleId: String) = {
    getDb(moduleId).map {
      _.autocomplete.runSyncUnsafe(requestTimeout)
    }.getOrElse(Map.empty)
  }

  def getDb(moduleId: String) = {
    for {
      module <- modules.get(moduleId)
      db <- module.db
    } yield db
  }
}
