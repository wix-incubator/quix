package quix.python

import monix.reactive.observers.Subscriber

class PythonBridge(val jobId: String) {

  import scala.collection.JavaConverters._

  var subscriberOpt: Option[Subscriber[PythonMessage]] = None

  def register(subscriber: Subscriber[PythonMessage]): Unit = {
    subscriberOpt = Option(subscriber)
  }

  def fields(columns: java.util.ArrayList[Any]): Unit = {
    for (subscriber <- subscriberOpt)
      subscriber.onNext(ProcessFields(jobId, columns.asScala.map(_.toString)))
  }

  def row(values: java.util.ArrayList[Any]): Unit = {
    for (subscriber <- subscriberOpt) {
      subscriber.onNext(ProcessRow(jobId, values.asScala))
    }
  }

  def error(message: String): Unit = {
    for (subscriber <- subscriberOpt) {
      subscriber.onNext(ProcessStdErrLine(jobId, message))
    }
  }

  def info(message: String): Unit = {
    for (subscriber <- subscriberOpt) {
      subscriber.onNext(ProcessStdOutLine(jobId, message))
    }
  }
}
