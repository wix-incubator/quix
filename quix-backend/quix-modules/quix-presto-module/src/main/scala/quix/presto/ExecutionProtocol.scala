package quix.presto

sealed trait PrestoEventData

sealed case class PrestoEvent(event: String, data: PrestoEventData)

sealed case class Start(id: String, numOfQueries: Int) extends PrestoEventData

sealed case class Error(id: String, message: String) extends PrestoEventData

sealed case class End(id: String) extends PrestoEventData

sealed case class SubQueryStart(id: String) extends PrestoEventData

sealed case class SubQueryFields(id: String, fields: List[String]) extends PrestoEventData

sealed case class SubQueryDetails(id: String, code: String) extends PrestoEventData

sealed case class SubQueryEnd(id: String) extends PrestoEventData

sealed case class SubQueryError(id: String, message: String) extends PrestoEventData

sealed case class Progress(id: String, percentage: Int) extends PrestoEventData

sealed case class Row(id: String, row: Map[String, AnyRef]) extends PrestoEventData


object Start {
  def apply(id: String, numOfQueries: Int): PrestoEvent = PrestoEvent("start", new Start(id, numOfQueries))
}

object End {
  def apply(id: String): PrestoEvent = PrestoEvent("end", new End(id))
}


object SubQueryStart {
  def apply(id: String): PrestoEvent = PrestoEvent("query-start", new SubQueryStart(id))
}

object SubQueryDetails {
  def apply(id: String, code: String): PrestoEvent = PrestoEvent("query-details", new SubQueryDetails(id, code))
}

object SubQueryEnd {
  def apply(id: String): PrestoEvent = PrestoEvent("query-end", new SubQueryEnd(id))
}

object SubQueryError {
  def apply(id: String, message: String): PrestoEvent = PrestoEvent("query-error", new SubQueryError(id, message))
}

object SubQueryFields {
  def apply(id: String, fields: List[String]): PrestoEvent = PrestoEvent("fields", new SubQueryFields(id, fields))
}

object Progress {
  def apply(id: String, percentage: Int): PrestoEvent = PrestoEvent("percentage", new Progress(id, percentage))
}

object Error {
  def apply(id: String, message: String): PrestoEvent = PrestoEvent("error", new Error(id, message))
}

object Row {
  def apply(id: String, data: Map[String, AnyRef]): PrestoEvent = PrestoEvent("row", new Row(id, data))
}