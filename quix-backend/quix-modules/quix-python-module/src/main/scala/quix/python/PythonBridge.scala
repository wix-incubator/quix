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
   * Each message would trigger some update of [[quix.api.v1.execute.Builder]]
   *
   * @param subscriber monix Subscriber that will receive every update from python
   */
  def register(subscriber: Subscriber[PythonMessage]): Unit = {
    subscriberOpt = Option(subscriber)
  }

  def error(message: String): Unit = {
    for (subscriber <- subscriberOpt) {
      subscriber.onNext(ProcessStderr(queryId, message))
    }
  }

  def info(message: String): Unit = {
    for (subscriber <- subscriberOpt) {
      subscriber.onNext(ProcessStdout(queryId, message))
    }
  }

  def tab_columns(tabId: String, columns: java.util.ArrayList[Any]): Unit = {
    for (subscriber <- subscriberOpt)
      subscriber.onNext(TabFields(tabId, columns.asScala.map(_.toString).toList))
  }

  def tab_row(tabId: String, columns: java.util.ArrayList[Any]): Unit = {
    for (subscriber <- subscriberOpt)
      subscriber.onNext(TabRow(tabId, columns.asScala.map(_.toString).toList))
  }

  def tab_end(tabId: String): Unit = {
    for (subscriber <- subscriberOpt)
      subscriber.onNext(TabEnd(tabId))
  }
}
