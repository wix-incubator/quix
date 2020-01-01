package quix.dummy

import monix.eval.Task
import quix.api.execute._

import scala.util.Random

class DummyQueryExecutor extends AsyncQueryExecutor[String, Batch] {

  override def runTask(query: ActiveQuery[String], builder: Builder[String, Batch]): Task[Unit] = {
    // all resources that are allocated per query can be allocated via Task
    val allocateResource = Task("Resource")

    // code that accepts resource and releases it
    val releaseResource = (_: String) => Task()

    // code that accepts resource and uses it to execute the query
    val useResource = (_: String) => generateExecution(query, builder)

    // similar to try-with-resources of Java 8 or try/catch/finally for older Java versions to release resources
    allocateResource.bracket(useResource)(releaseResource)
  }

  /** generates execution that consist of 2 subqueries with random results and failing last subquery */
  def generateExecution(query: ActiveQuery[String], builder: Builder[String, Batch]): Task[Unit] = {
    for {
      // can happen only once
      _ <- builder.start(query)

      // each sub query will be rendered as different tab in quix-frontend
      _ <- generateBatches("first-sub-query", builder)
      _ <- generateBatches("second-sub-query", builder)

      // third query will fail
      _ <- builder.startSubQuery("third-sub-query", "failing sub query", Batch(
        error = Option(BatchError("failing sub query"))
      ))

      // can happen only once
      _ <- builder.end(query)
    } yield ()
  }


  /** generates random data set and creates a list of monix Tasks that send it to builder when executed */
  def generateBatches(subQueryId: String, builder: Builder[String, Batch]): Task[Unit] = {
    val columnsCount = Random.nextInt(10)
    val columns = for (i <- 0 to columnsCount) yield BatchColumn(s"column_$i")
    val firstBatch = Batch(columns = Option(columns))

    val batchCount = Random.nextInt(10)
    val rowCount = Random.nextInt(100)

    val batches = for (batch <- 0 to batchCount) yield {
      val rows = for (i <- 0 to rowCount) yield Seq.fill(columns.size)(batch * i)

      Batch(data = rows)
    }

    for {
      _ <- builder.startSubQuery(subQueryId, s"random results made of $columnsCount columns, $batchCount batches with $rowCount each", firstBatch)
      _ <- Task.traverse(batches) { batch =>
        builder.addSubQuery(subQueryId, batch)
      }
    } yield ()

  }
}
