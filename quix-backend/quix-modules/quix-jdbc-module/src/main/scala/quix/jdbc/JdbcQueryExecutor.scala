package quix.jdbc

import java.net.{ConnectException, SocketException, SocketTimeoutException}
import java.util

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import quix.api.execute._
import quix.core.utils.TaskOps._

import scala.collection.JavaConverters._
import scala.collection.immutable
import scala.concurrent.duration._

class JdbcQueryExecutor(
                     val readJdbcClient: NamedParameterJdbcTemplate,
                     val initialAdvanceDelay: FiniteDuration = 100.millis,
                    val maxAdvanceDelay: FiniteDuration = 33.seconds)
  extends AsyncQueryExecutor[String, Batch] with LazyLogging {




  def runTask(query: ActiveQuery[String], builder: Builder[String, Batch]): Task[Unit] = {


    val task = for {
      _ <- Task.eval(logger.info("strat todo"))
      _ <- Task {
      builder.start(query)

        val res = readJdbcClient.queryForList(query.text, new util.HashMap[String, Object]())
        val columns  = createColumns(res)

        val result:  List[List[AnyRef]] = res.asScala.toList.map(a  => {List(a.values().asScala.toList)})

        builder.addSubQuery("1" , Batch(result ,Some(columns)))

        builder.end(query)

      }
      _ <- Task.eval(logger.info(s"method=runAsync event=end query-id=${query.id} user=${query.user.email} rows=${builder.rowCount}"))
    } yield ()

    task
  }

  def createColumns(result : java.util.List[java.util.Map[String, Object]]): List[BatchColumn] = {

    if (!result.isEmpty){
      result.get(0).keySet().asScala.toList.map(BatchColumn)
    } else {
      List.empty
    }

  }

}
