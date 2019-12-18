package quix.python

sealed trait PythonMessage

case class ProcessStartSuccess(jobId: String) extends PythonMessage

case class ProcessStartFailure(t: Throwable) extends PythonMessage

case class ProcessEndSuccess(jobId: String) extends PythonMessage

case class TabFields(tabId: String, fields: Seq[String]) extends PythonMessage

case class TabRow(tabId: String, row: Seq[Any]) extends PythonMessage

case class TabEnd(tabId: String) extends PythonMessage

case class ProcessStdout(jobId: String, line: String) extends PythonMessage

case class ProcessStderr(jobId: String, line: String) extends PythonMessage

case class Line(str: String, isPartial: Boolean = false)

case class PythonCode(code: String, modules: Seq[String] = Nil)