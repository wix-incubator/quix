package quix.api.execute

case class BatchColumn(name: String)

case class BatchError(message: String)

case class BatchStats(state: String, percentage: Int)

case class Batch(data: List[List[Any]],
                 columns: Option[List[BatchColumn]] = None,
                 stats: Option[BatchStats] = None,
                 error: Option[BatchError] = None)
