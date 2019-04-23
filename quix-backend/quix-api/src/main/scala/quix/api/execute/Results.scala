package quix.api.execute

case class ResultsColumn(name: String)

case class ResultsError(message: String)

case class ResultsStats(state: String, percentage: Int)

case class Results(data: List[List[AnyRef]],
                   columns: Option[List[ResultsColumn]] = None,
                   stats: Option[ResultsStats] = None,
                   error: Option[ResultsError] = None)
