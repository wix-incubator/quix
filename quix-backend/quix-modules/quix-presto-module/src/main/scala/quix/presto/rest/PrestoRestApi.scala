package quix.presto.rest

import com.fasterxml.jackson.annotation.{JsonIgnoreProperties, JsonProperty}

@JsonIgnoreProperties(ignoreUnknown = true)
case class PrestoState(id: String,
                       infoUri: String,
                       partialCancelUri: Option[String],
                       nextUri: Option[String],
                       columns: Option[List[PrestoColumn]],
                       data: Option[List[List[AnyRef]]],
                       stats: PrestoStats,
                       error: Option[PrestoError],
                       updateType: Option[String])

@JsonIgnoreProperties(ignoreUnknown = true)
case class PrestoColumn(@JsonProperty("name") name: String,
                        @JsonProperty("type") dataType: String)


@JsonIgnoreProperties(ignoreUnknown = true)
case class PrestoError(message: String,
                       errorCode: Int,
                       errorName: String,
                       errorType: String,
                       errorLocation: Option[PrestoErrorLocation],
                       failureInfo: PrestoErrorFailureInfo)

@JsonIgnoreProperties(ignoreUnknown = true)
case class PrestoErrorLocation(lineNumber: Int, columnNumber: Int)

@JsonIgnoreProperties(ignoreUnknown = true)
case class PrestoErrorFailureInfo(`type`: String, stack: Seq[String])


@JsonIgnoreProperties(ignoreUnknown = true)
case class PrestoStats(state: String,
                       scheduled: Boolean,
                       nodes: Long,
                       totalSplits: Long,
                       queuedSplits: Long,
                       runningSplits: Long,
                       completedSplits: Long,
                       userTimeMillis: Long,
                       cpuTimeMillis: Long,
                       wallTimeMillis: Long,
                       processedRows: Long,
                       processedBytes: Long)

@JsonIgnoreProperties(ignoreUnknown = true)
case class PrestoHealth(runningQueries: Int,
                        blockedQueries: Int,
                        queuedQueries: Int,
                        activeWorkers: Int,
                        runningDrivers: Int,
                        reservedMemory: Int,
                        rowInputRate: Int,
                        byteInputRate: Int,
                        cpuTimeRate: Int)

@JsonIgnoreProperties(ignoreUnknown = true)
case class PrestoQueryInfo(queryId: String,
                           state: String,
                           queryStats: PrestoQueryStats)

@JsonIgnoreProperties(ignoreUnknown = true)
case class PrestoQueryStats(outputDataSize: String,
                            processedInputDataSize: String,
                            processedInputPositions: Long,
                            queuedTime: String,
                            analysisTime: String,
                            totalPlanningTime: String,
                            outputPositions: Long)


case class Results(@JsonProperty("headers") columns: Option[List[PrestoColumn]],
                   @JsonProperty("data") data: List[List[AnyRef]],
                   @JsonProperty("stats") stats: ResultsStats,
                   @JsonProperty("prestoId") prestoId: String,
                   @JsonProperty("error") error: Option[PrestoError] = None)

case class ResultsStats(@JsonProperty("state") state: String,
                        @JsonProperty("completed") completed: Int,
                        @JsonProperty("moreData") moreData: Option[AnyRef] = None)

object Results {

  def apply(state: PrestoState): Results = {
    val stats = state.stats
    val completed = {
      val total = stats.totalSplits
      val done = stats.completedSplits
      if (total > 0)
        Math.round((done.toFloat / total.toFloat) * 100)
      else 0
    }

    new Results(state.columns, state.data.getOrElse(Nil), ResultsStats(stats.state, completed), prestoId = state.id, error = state.error)
  }

  def apply(results: Results, moreData: AnyRef) = {
    val newStats = results.stats.copy(moreData = Option(moreData))
    results.copy(stats = newStats)
  }
}

trait PrestoSql {
  def text: String

  def session: Map[String, String]
}

class ActiveQueryNotFound(id: String) extends RuntimeException(s"query with id $id wasn't not found")