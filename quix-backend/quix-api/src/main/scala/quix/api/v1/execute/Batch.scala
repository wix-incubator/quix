package quix.api.v1.execute

case class BatchColumn(name: String)

case class BatchError(message: String)

/** Used in [[quix.api.v1.execute.Builder]] to send batched payloads from [[quix.api.v1.module.ExecutionModule]] to
 * [[quix.api.v1.execute.Consumer]]
 *
 * @param data list of rows
 * @param columns optional list of column names
 * @param error optional error
 * @param stats optional stats object for custom properties
 */
case class Batch(data: Seq[Seq[Any]] = Seq.empty,
                 columns: Option[Seq[BatchColumn]] = None,
                 error: Option[BatchError] = None,
                 stats: Map[String, Any] = Map.empty)


object Batch {
  val PERCENTAGE = "percentage"
  val STATUS = "status"
  val TYPE = "type"

  implicit class BatchStatsOps(val batch: Batch) extends AnyVal {
    def percentage = {
      batch.stats.get(PERCENTAGE) match {
        case Some(value: Int) => Some(value)
        case _ => None
      }
    }

    def queryType: Option[String] = {
      batch.stats.get(TYPE) match {
        case Some(value: String) => Some(value)
        case _ => None
      }
    }

    def withPercentage(percentage: Int): Batch = {
      batch.copy(stats = batch.stats.updated(PERCENTAGE, percentage))
    }

    def withStatus(status: String) = {
      batch.copy(stats = batch.stats.updated(STATUS, status))
    }

    def withType(queryType: String) = {
      batch.copy(stats = batch.stats.updated(TYPE, queryType))
    }
  }

}
