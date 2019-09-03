package quix.presto.rest

import com.fasterxml.jackson.annotation.{JsonIgnoreProperties, JsonProperty}
import quix.api.execute.{Batch, BatchColumn, BatchError}

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
                           queryStats: PrestoQueryStats,
                           setCatalog: Option[String],
                           setSchema: Option[String],
                           setSessionProperties: Map[String, String],
                           resetSessionProperties: List[String])

@JsonIgnoreProperties(ignoreUnknown = true)
case class PrestoQueryStats(outputDataSize: String,
                            processedInputDataSize: String,
                            processedInputPositions: Long,
                            queuedTime: String,
                            analysisTime: String,
                            totalPlanningTime: String,
                            outputPositions: Long)


object PrestoStateToResults {

  def apply(state: PrestoState): Batch = {
    val stats = state.stats
    val completed = {
      val total = stats.totalSplits
      val done = stats.completedSplits
      if (total > 0)
        Math.round((done.toFloat / total.toFloat) * 100)
      else 0
    }

    val columns = state.columns.map(_.map(pc => BatchColumn(pc.name)))
    val error = state.error.map(pe => BatchError(pe.message))

    val batch = Batch(state.data.getOrElse(Nil), columns, error = error)
      .withPercentage(completed)
      .withStatus(state.stats.state)

    state.updateType.map { queryType =>
      batch.withType(queryType)
    }.getOrElse(batch)
  }
}

class ActiveQueryNotFound(id: String) extends RuntimeException(s"query with id $id wasn't not found")