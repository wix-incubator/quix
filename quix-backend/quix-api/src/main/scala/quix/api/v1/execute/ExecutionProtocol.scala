package quix.api.v1.execute

sealed trait EventData

/**
 * Event used to communicate changes
 *
 * @param event event name, shared between quix backend and quix frontend
 * @param data  data that arrives with every event
 */
sealed case class ExecutionEvent(event: String, data: EventData)

sealed case class Start(id: String, numOfQueries: Int) extends EventData

sealed case class Error(id: String, message: String) extends EventData

sealed case class End(id: String) extends EventData

sealed case class SubQueryStart(id: String) extends EventData

sealed case class SubQueryFields(id: String, fields: Seq[String]) extends EventData

sealed case class SubQueryDetails[Code](id: String, code: Code) extends EventData

sealed case class SubQueryEnd(id: String, statistics: Map[String, Any]) extends EventData

sealed case class SubQueryError(id: String, message: String) extends EventData

sealed case class Progress(id: String, percentage: Int) extends EventData

sealed case class Row(id: String, values: Seq[Any]) extends EventData

sealed case class Download(id: String, url: String) extends EventData

sealed case class StartCommand[Code](code: Code, session: Map[String, String]) extends EventData

sealed case class Log(id: String, line: String, level: String) extends EventData

object Empty extends EventData

object Start {
  def apply(id: String, numOfQueries: Int): ExecutionEvent = ExecutionEvent("start", new Start(id, numOfQueries))
}

object End {
  def apply(id: String): ExecutionEvent = ExecutionEvent("end", new End(id))
}


object SubQueryStart {
  def apply(id: String): ExecutionEvent = ExecutionEvent("query-start", new SubQueryStart(id))
}

object SubQueryDetails {
  def apply[Code](id: String, code: Code): ExecutionEvent = ExecutionEvent("query-details", new SubQueryDetails(id, code))
}

object SubQueryEnd {
  def apply(id: String, statistics: Map[String, Any] = Map.empty): ExecutionEvent = ExecutionEvent("query-end", new SubQueryEnd(id, statistics))
}

object SubQueryError {
  def apply(id: String, message: String): ExecutionEvent = ExecutionEvent("error", new SubQueryError(id, message))
}

object SubQueryFields {
  def apply(id: String, fields: Seq[String]): ExecutionEvent = ExecutionEvent("fields", new SubQueryFields(id, fields))
}

object Progress {
  def apply(id: String, percentage: Int): ExecutionEvent = ExecutionEvent("percentage", new Progress(id, percentage))
}

object Error {
  def apply(id: String, message: String): ExecutionEvent = ExecutionEvent("error", new Error(id, message))
}

object Row {
  def apply(id: String, values: Seq[Any]): ExecutionEvent = ExecutionEvent("row", new Row(id, values))
}

object Pong {
  def apply(id: String): ExecutionEvent = ExecutionEvent("pong", Empty)
}

object Download {
  def apply(id: String, url: String): ExecutionEvent = ExecutionEvent("query-download", new Download(id, url))
}

object Log {
  def apply(id: String, line: String, level: String): ExecutionEvent = ExecutionEvent("log", new Log(id, line, level))
}