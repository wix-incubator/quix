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

  def search(catalogs: List[Catalog], query: String): List[Catalog] = search(catalogs, DbQuery(query))

  def search(catalogs: List[Catalog], query: DbQuery): List[Catalog] = {
    val filtered = catalogs.map {

      case catalog if query.matches(catalog.name) =>
        catalog

      case catalog =>
        val schemas = catalog.children

        val filtered = schemas.map {
          case schema if query.matches(schema.name) =>
            schema

          case schema =>
            val tables = schema.children
            val filtered = tables.filter(table => query.matches(table.name))

            schema.copy(children = filtered)
        }.filter(schema => schema.children.nonEmpty || query.matches(schema.name))

        catalog.copy(children = filtered)
    }.filter(catalog => catalog.children.nonEmpty || query.matches(catalog.name))

    filtered
  }
}

trait DbQuery {
  def matches(name: String): Boolean
}

object DbQuery {
  def apply(query: String): DbQuery = {
    query match {

      case null =>
        DbQueryFalse

      case query if isExactMatch(query) =>
        new DbQueryExactMatch(query.substring(1, query.length - 1))

      case _ =>
        new DbQueryContains(query)
    }
  }

  private def isExactMatch(query: String) = {
    query.startsWith("\"") & query.endsWith("\"") || query.startsWith("'") & query.endsWith("'")
  }
}

class DbQueryContains(query: String) extends DbQuery {
  override def matches(name: String): Boolean = name.contains(query)
}

class DbQueryExactMatch(query: String) extends DbQuery {
  override def matches(name: String): Boolean = query == name
}

object DbQueryFalse extends DbQuery {
  override def matches(name: String): Boolean = false
}