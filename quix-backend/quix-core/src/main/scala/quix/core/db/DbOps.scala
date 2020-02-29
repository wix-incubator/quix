package quix.core.db

import com.typesafe.scalalogging.LazyLogging
import quix.api.v1.db.Catalog

object DbOps extends LazyLogging {
  def mergeNewAndOldCatalogs(newCatalogs: List[Catalog], oldCatalogs: List[Catalog]): List[Catalog] = {
    newCatalogs.map { newCatalog =>
      val maybeOldCatalog = oldCatalogs.find(_.name == newCatalog.name)

      (newCatalog, maybeOldCatalog) match {
        case (_, None) =>
          newCatalog

        case (_, Some(oldCatalog)) if newCatalog.children.isEmpty =>
          logger.warn("Catalog " + newCatalog + "is empty")
          oldCatalog

        case _ =>
          newCatalog
      }
    }
  }

  def search(catalogs: List[Catalog], query: String): List[Catalog] = {
    val filtered = catalogs.map { catalog =>
      val schemas = catalog.children

      val filtered = schemas.map { schema =>
        val tables = schema.children
        val filtered = tables.filter(_.name.contains(query))

        schema.copy(children = filtered)
      }.filter(schema => schema.children.nonEmpty || schema.name.contains(query))

      catalog.copy(children = filtered)
    }.filter(catalog => catalog.children.nonEmpty || catalog.name.contains(query))

    filtered
  }
}
