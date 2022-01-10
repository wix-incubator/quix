package quix.core.download

import com.opencsv.CSVWriter
import monix.eval.Task
import quix.api.v1.execute.{Builder => _, _}
import quix.api.v2.execute._
import quix.core.executions.DelegatingBuilder

import java.io.{BufferedWriter, OutputStream, OutputStreamWriter}
import java.nio.file.{Files, Paths}
import java.util.concurrent.ConcurrentHashMap
import java.util.zip.GZIPOutputStream

class DownloadableBuilder[Code](delegate: Builder,
                                downloadConfig: DownloadConfig,
                                queryResultsStorage: QueryResultsStorage,
                                consumer: Consumer[ExecutionEvent])
  extends DelegatingBuilder(delegate) {
  val sentColumnsPerQuery = collection.mutable.Set.empty[String]
  val openStreams = new ConcurrentHashMap[String, OutputStream]

  override def startSubQuery(subQueryId: String, code: String): Task[Unit] = {
    for {
      _ <- delegate.startSubQuery(subQueryId, code)
      _ <- createNewFile(subQueryId)
    } yield ()
  }

  override def addSubQuery(subQueryId: String, results: Batch): Task[Unit] = {
    sendColumns(subQueryId, results.columns) >>
      use(subQueryId, results.data)
  }

  override def endSubQuery(subQueryId: String, stats: Map[String, Any]): Task[Unit] = {
    for {
      _ <- delegate.endSubQuery(subQueryId, stats).attempt
      _ <- close(subQueryId)
      _ <- consumer.write(Download(subQueryId, "/api/download/" + subQueryId))
      _ <- Task(sentColumnsPerQuery.remove(subQueryId))
    } yield ()
  }

  override def errorSubQuery(subQueryId: String, e: Throwable): Task[Unit] = {
    for {
      _ <- delegate.errorSubQuery(subQueryId, e).attempt
      _ <- cancel(subQueryId)
      _ <- Task(sentColumnsPerQuery.remove(subQueryId))
    } yield ()
  }

  def sendColumns(subQueryId: String, columnsOpt: Option[Seq[BatchColumn]]) = {
    columnsOpt match {
      case Some(columns) if !sentColumnsPerQuery.contains(subQueryId) =>
        use(subQueryId, Seq(columns.map(_.name))) >>
          Task(sentColumnsPerQuery.add(subQueryId))

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
    val writer = new CSVWriter(new BufferedWriter(new OutputStreamWriter(stream, "UTF-8")))

    if (rows.nonEmpty && stream != null) {
      rows.foreach(row => writer.writeNext(row.toArray.map(nullToEmpty), true))
      writer.flush()
    }
  }

  def nullToEmpty(any: Any): String = if (any == null) "" else any.toString

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
