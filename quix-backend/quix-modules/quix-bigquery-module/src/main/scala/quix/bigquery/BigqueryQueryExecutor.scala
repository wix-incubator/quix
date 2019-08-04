package quix.bigquery

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.execute._

import scala.concurrent.duration.{FiniteDuration, _}

class BigqueryQueryExecutor(val initialAdvanceDelay: FiniteDuration = 100.millis,
                            val maxAdvanceDelay: FiniteDuration = 15.seconds)
  extends AsyncQueryExecutor[String, Batch] with LazyLogging {

  override def runTask(query: ActiveQuery[String], builder: Builder[String, Batch]): Task[Unit] = ???
}


object BigqueryQueryExecutor {
  def apply(config: BigqueryConfig) = {

    new BigqueryQueryExecutor()
  }
}