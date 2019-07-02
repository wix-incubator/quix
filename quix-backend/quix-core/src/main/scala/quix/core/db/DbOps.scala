package quix.core.db

import com.typesafe.scalalogging.LazyLogging
import quix.api.db.Catalog

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
}
