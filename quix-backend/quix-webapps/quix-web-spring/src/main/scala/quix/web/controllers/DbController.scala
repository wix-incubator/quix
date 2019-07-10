package quix.web.controllers

import monix.execution.Scheduler.Implicits.global
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation._
import quix.api.db.Table
import quix.api.execute.Batch
import quix.api.module.ExecutionModule

@Controller
@RequestMapping(Array("/api"))
class DbController(modules: Map[String, ExecutionModule[String, Batch]]) {

  @CrossOrigin(origins = Array("*"), allowedHeaders = Array("*"))
  @RequestMapping(value = Array("/db/config"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getDbConfig = {
    Map("trees" -> modules.keySet)
  }

  @CrossOrigin(origins = Array("*"), allowedHeaders = Array("*"))
  @RequestMapping(value = Array("/db/{moduleId}/explore"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getCatalogsNoColumns(@PathVariable moduleId: String) = {
    getDb(moduleId).map {
      _.getCatalogs.runSyncUnsafe()
    }.getOrElse(Nil)
  }

  @CrossOrigin(origins = Array("*"), allowedHeaders = Array("*"))
  @RequestMapping(value = Array("/db/{moduleId}/explore/{catalog}/{schema}/{table}"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getTable(@PathVariable moduleId: String, @PathVariable catalog: String, @PathVariable schema: String, @PathVariable table: String) = {
    getDb(moduleId).map {
      _.getTable(catalog, schema, table).runSyncUnsafe()
    }.getOrElse(Table(table, Nil))
  }

  @CrossOrigin(origins = Array("*"), allowedHeaders = Array("*"))
  @RequestMapping(value = Array("/db/{moduleId}/autocomplete"), method = Array(RequestMethod.GET))
  @ResponseBody
  def autocomplete(@PathVariable moduleId: String) = {
    getDb(moduleId).map {
      _.getAutocomplete.runSyncUnsafe()
    }.getOrElse(Map.empty)
  }

  @CrossOrigin(origins = Array("*"), allowedHeaders = Array("*"))
  @RequestMapping(value = Array("/db/{moduleId}/search"), method = Array(RequestMethod.GET))
  @ResponseBody
  def search(@PathVariable moduleId: String, @RequestParam("q") query: String) = {
    getDb(moduleId).map {
      _.search(query).runSyncUnsafe()
    }.getOrElse(Map.empty)
  }

  def getDb(moduleId: String) = {
    for {
      module <- modules.get(moduleId)
      db <- module.db
    } yield db
  }
}
