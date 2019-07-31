package quix.api.execute

case class BatchColumn(name: String)

case class BatchError(message: String)

case class BatchStats(state: String, percentage: Int)

case class Batch(data: Seq[Seq[Any]],
                 columns: Option[Seq[BatchColumn]] = None,
                 stats: Option[BatchStats] = None,
                 error: Option[BatchError] = None)
