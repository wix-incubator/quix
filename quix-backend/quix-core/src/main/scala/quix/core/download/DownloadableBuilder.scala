package quix.core.download

import java.io.OutputStream
import java.nio.file.{Files, Paths}
import java.util.concurrent.ConcurrentHashMap
import java.util.zip.GZIPOutputStream

import monix.eval.Task
import quix.api.execute._
import quix.core.executions.DelegatingBuilder

class DownloadableBuilder[Code](delegate: Builder[Code, Batch],
                                downloadConfig: DownloadConfig,
                                queryResultsStorage: QueryResultsStorage,
                                consumer: Consumer[ExecutionEvent])
  extends DelegatingBuilder[Code, Batch](delegate) {
  val sentColumnsPerQuery = collection.mutable.Set.empty[String]
  val openStreams = new ConcurrentHashMap[String, OutputStream]

  override def startSubQuery(queryId: String, code: Code, results: Batch): Task[Unit] = {
    for {
      _ <- delegate.startSubQuery(queryId, code, results.copy(data = List.empty))
      _ <- createNewFile(queryId)
      _ <- addSubQuery(queryId, results)
    } yield ()
  }

  override def addSubQuery(queryId: String, results: Batch): Task[Unit] = {
    sendColumns(queryId, results.columns) >>
      use(queryId, results.data)
  }

  override def endSubQuery(queryId: String, statistics: Map[String, Any]): Task[Unit] = {
    for {
      _ <- delegate.endSubQuery(queryId, statistics).attempt
      _ <- close(queryId)
      _ <- consumer.write(Download(queryId, "/api/download/" + queryId))
      _ <- Task(sentColumnsPerQuery.remove(queryId))
    } yield ()
  }

  override def errorSubQuery(queryId: String, e: Throwable): Task[Unit] = {
    for {
      _ <- delegate.errorSubQuery(queryId, e).attempt
      _ <- cancel(queryId)
      _ <- Task(sentColumnsPerQuery.remove(queryId))
    } yield ()
  }

  def sendColumns(queryId: String, columnsOpt: Option[Seq[BatchColumn]]) = {
    columnsOpt match {
      case Some(columns) if !sentColumnsPerQuery.contains(queryId) =>
        use(queryId, Seq(columns.map(_.name))) >>
          Task(sentColumnsPerQuery.add(queryId))

      case _ => Task.unit

    }
  }

  def createNewFile(subQueryId: String): Task[Unit] = {
    val path = Paths.get(downloadConfig.downloadDir, subQueryId)

    val writerTask = Task(Files.createDirectories(Paths.get(downloadConfig.downloadDir))) >>
      Task(Files.deleteIfExists(path)) >>
      Task(Files.createFile(path)) >>
      Task(new GZIPOutputStream(Files.newOutputStream(path)))

    for {
      writer <- writerTask
      _ <- Task(openStreams.put(subQueryId, writer))
    } yield writer
  }

  def use(subQueryId: String, rows: Seq[Seq[Any]]): Task[Unit] = Task {
    val stream = openStreams.get(subQueryId)

    if (rows.nonEmpty && stream != null) {
      val string = rows
        .map(row => row.map(CsvUtils.quote))
        .map(row => row.mkString(","))
        .mkString("", "\n", "\n")

      stream.write(string.getBytes("UTF-8"))
    }
  }

  def close(subQueryId: String): Task[Unit] = {
    val path = Paths.get(downloadConfig.downloadDir, subQueryId)

    openStreams.get(subQueryId) match {
      case null => Task.unit
      case stream =>
        Task(stream.flush()).attempt >>
          Task(stream.close()).attempt >>
          Task(openStreams.remove(subQueryId)) >>
          queryResultsStorage.upload(subQueryId, path)
    }
  }

  def cancel(subQueryId: String): Task[Unit] = {
    val path = Paths.get(downloadConfig.downloadDir, subQueryId)

    close(subQueryId) >> Task(Files.deleteIfExists(path))
  }

}
