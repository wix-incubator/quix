package quix.jdbc

import java.util

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import quix.api.execute._

import scala.collection.JavaConverters._
import scala.concurrent.duration._

class JdbcQueryExecutor(readJdbcClient: NamedParameterJdbcTemplate,
                        initialAdvanceDelay: FiniteDuration = 100.millis,
                        maxAdvanceDelay: FiniteDuration = 33.seconds)
  extends AsyncQueryExecutor[String, Batch] with LazyLogging {


  def runTask(query: ActiveQuery[String], builder: Builder[String, Batch]): Task[Unit] = {


    val task = for {
      _ <- Task.eval(logger.info("strat todo"))
      _ <- Task {
        builder.start(query)

        val res = readJdbcClient.queryForList(query.text, new util.HashMap[String, Object]())
        val columns = createColumns(res)

        val result: List[List[AnyRef]] = res.asScala.toList.map(a => {
          a.values().asScala.toList
        })

        builder.addSubQuery(query.id, Batch(result, Some(columns)))

        builder.end(query)

      }
      _ <- Task.eval(logger.info(s"method=runAsync event=end query-id=${query.id} user=${query.user.email} rows=${builder.rowCount}"))
    } yield ()

    task
  }

  def createColumns(result: java.util.List[java.util.Map[String, Object]]): List[BatchColumn] = {

    if (!result.isEmpty) {
      result.get(0).keySet().asScala.toList.map(BatchColumn)
    } else {
      List.empty
    }

  }

}
