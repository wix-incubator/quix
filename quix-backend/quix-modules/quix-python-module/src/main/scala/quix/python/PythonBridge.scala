package quix.python

import monix.reactive.observers.Subscriber

/** Python Bridge is py4j bridge to connect between methods defined in quix.py and Quix execution model
 *
 * @param queryId the queryId that started the execution, it will be used to generate events in context of singe query
 */
class PythonBridge(val queryId: String) {

  import scala.collection.JavaConverters._

  var subscriberOpt: Option[Subscriber[PythonMessage]] = None

  /** Python bridge will produce a stream of [[PythonMessage]] messages to communicate with quix.
   * Each message would trigger some update of [[quix.api.execute.Builder]]
   * @param subscriber monix Subscriber that will receive every update from python
   */
  def register(subscriber: Subscriber[PythonMessage]): Unit = {
    subscriberOpt = Option(subscriber)
  }

  def fields(columns: java.util.ArrayList[Any]): Unit = {
    for (subscriber <- subscriberOpt)
      subscriber.onNext(ProcessFields(queryId, columns.asScala.map(_.toString)))
  }

  def row(values: java.util.ArrayList[Any]): Unit = {
    for (subscriber <- subscriberOpt) {
      subscriber.onNext(ProcessRow(queryId, values.asScala))
    }
  }

  def error(message: String): Unit = {
    for (subscriber <- subscriberOpt) {
      subscriber.onNext(ProcessStdErrLine(queryId, message))
    }
  }

  def info(message: String): Unit = {
    for (subscriber <- subscriberOpt) {
      subscriber.onNext(ProcessStdOutLine(queryId, message))
    }
  }
}
