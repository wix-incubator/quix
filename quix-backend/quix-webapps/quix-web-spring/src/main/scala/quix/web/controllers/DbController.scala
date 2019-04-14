package quix.web.controllers

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation._
import quix.api.db.Db

@Controller
@RequestMapping(Array("/api"))
class DbController(db: Db) {

  @CrossOrigin(origins = Array("*"), allowedHeaders = Array("*"))
  @RequestMapping(value = Array("/db/explore"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getCatalogsNoColumns = {
    db.catalogs
  }

  @CrossOrigin(origins = Array("*"), allowedHeaders = Array("*"))
  @RequestMapping(value = Array("/db/explore/{catalog}/{schema}/{table}"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getTable(@PathVariable catalog: String, @PathVariable schema: String, @PathVariable table: String) = {
    db.table(catalog, schema, table)
  }
}
