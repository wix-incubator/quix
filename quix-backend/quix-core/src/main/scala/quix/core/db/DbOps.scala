package quix.core.db

import com.typesafe.scalalogging.LazyLogging
import quix.api.db.{Catalog, Schema}

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
    catalogs.collect {
      case catalog if catalog.name.contains(query) =>
        catalog

      case catalog if catalog.children.exists(schema => matches(schema, query)) =>
        catalog.copy(children = catalog.children.collect {
          case schema if schema.name.contains(query) =>
            schema

          case schema if schema.children.exists(_.name.contains(query)) =>
            schema.copy(children = schema.children.filter(_.name.contains(query)))
        })
    }
  }

  def matches(schema: Schema, query: String): Boolean = {
    schema.name.contains(query) || schema.children.exists(_.name.contains(query))
  }
}
