package quix.python

sealed trait PythonMessage

case class JobStartSuccess(jobId: String) extends PythonMessage

case class JobStartFailure(t: Throwable) extends PythonMessage

case class JobEndSuccess(jobId: String) extends PythonMessage

case class ProcessFields(jobId: String, fields: Seq[String]) extends PythonMessage

case class ProcessRow(jobId: String, row: Seq[Any]) extends PythonMessage

case class ProcessStdOutLine(jobId: String, line: String) extends PythonMessage

case class ProcessStdErrLine(jobId: String, line: String) extends PythonMessage

case class Line(str: String, isPartial: Boolean = false)

case class PythonCode(code: String, modules: Seq[String] = Nil)