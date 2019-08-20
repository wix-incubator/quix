package quix.bigquery.db

import com.google.cloud.bigquery.{BigQuery, DatasetId}
import monix.eval.Task
import quix.api.db.{Catalog, Catalogs, Schema, Table}
import quix.bigquery.BigQueryConfig

import scala.collection.JavaConverters._

class BigQueryCatalogs(config: BigQueryConfig, val bigquery: BigQuery) extends Catalogs {

  override def fast: Task[List[Catalog]] = {
    for {
      datasets <- Task(bigquery.listDatasets()).map(_.iterateAll().asScala.toList)
    } yield List(Catalog("__root", datasets.map(ds => Schema(ds.getDatasetId.getDataset, Nil))))
  }

  override def full: Task[List[Catalog]] = {
    for {
      datasets <- Task(bigquery.listDatasets()).map(_.iterateAll().asScala.toList)
      schemas <- Task.traverse(datasets.map(_.getDatasetId))(inferSchemaInOneQuery)
    } yield List(Catalog("__root", schemas))
  }

  def inferSchemaInOneQuery(datasetId: DatasetId): Task[Schema] = {
    for {
      dataset <- Task(bigquery.getDataset(datasetId))
      tables <- Task(dataset.list().iterateAll().asScala.toList)
    } yield {
      val tablesNames = tables.map(table => Table(table.getTableId.getTable, List()))
      Schema(datasetId.getDataset, tablesNames.sortBy(_.name))
    }
  }
}
