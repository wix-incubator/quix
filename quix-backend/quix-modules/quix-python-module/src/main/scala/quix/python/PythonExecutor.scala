package quix.python

import java.nio.file.{Files, Paths}

import com.google.common.io.Resources
import com.typesafe.scalalogging.LazyLogging
import com.zaxxer.nuprocess.NuProcessBuilder
import monix.eval.Task
import monix.execution.Cancelable
import monix.execution.atomic.AtomicInt
import monix.reactive.Observable
import monix.reactive.observers.Subscriber
import py4j.GatewayServer
import quix.api.execute._
import quix.core.utils.TaskOps._

import scala.io.Source

class PythonExecutor extends AsyncQueryExecutor[String, Batch] with LazyLogging {

  var port = AtomicInt(25333)

  val quixPyContent = {
    val source = Source.fromFile(Resources.getResource("quix.py").toURI)
    val content = source.mkString.getBytes("UTF-8")
    source.close()
    content
  }

  def makeProcess(query: ActiveQuery[String]): Task[PythonRunningProcess] = {
    val task = for {
      process <- Task(PythonRunningProcess(query.id))

      file <- Task(Files.createTempFile(query.user.id, ".py"))
      _ <- Task(process.file = Option(file))
      _ <- Task(Files.write(file, query.text.getBytes("UTF-8")))
      _ <- Task(logger.info(s"method=makeProcess event=create-file query-id=${query.id} user=${query.user.email} file=$file query=${query.text}"))
      _ <- Task(Files.write(Paths.get(file.getParent.toString, "quix.py"), quixPyContent))

      bridge <- Task(new PythonBridge(query.id))
      _ <- Task(process.bridge = Option(bridge))
      gatewayServer <- Task(new GatewayServer(bridge, port.incrementAndGet()))
      _ <- Task(process.gatewayServer = Option(gatewayServer))
      _ <- Task(gatewayServer.start())
      _ <- Task(logger.info(s"method=makeProcess event=started-py4bridge query-id=${query.id} user=${query.user.email} port=${port.get()}"))

    } yield process

    task
      .logOnError(s"method=makeProcess event=failure query-id=${query.id} user=${query.user.email} port=${port.get()}")
  }

  def run(process: PythonRunningProcess, query: ActiveQuery[String], builder: Builder[String, Batch]): Task[Unit] = {
    val observable = new Observable[PythonMessage] {
      override def unsafeSubscribeFn(subscriber: Subscriber[PythonMessage]): Cancelable = {
        logger.info(s"method=run event=starting-process-observable query-id=${query.id} user=${query.user.email}")
        val pb = new NuProcessBuilder("python3", "-W", "ignore",
          process.file.getOrElse(throw new IllegalStateException("No file to execute")).toString,
          process.gatewayServer.getOrElse(throw new IllegalStateException("No running gateway")).getPort.toString)
        val handler = new PythonProcessHandler(query.id, subscriber)
        pb.setProcessListener(handler)
        pb.start()
        logger.info(s"method=run event=started-process-observable query-id=${query.id} user=${query.user.email} process=${pb.command()}")

        () => {}
      }
    }

    val data: Observable[PythonMessage] = (subscriber: Subscriber[PythonMessage]) => {
      val bridge = process.bridge.getOrElse(throw new IllegalStateException("No python bridge"))
      bridge.register(subscriber)

      () => {}
    }

    Observable(data, observable).merge
      .takeWhileInclusive {
        case JobEndSuccess(_) =>
          logger.info(s"method=run event=got-job-end-success query-id=${query.id} user=${query.user.email}")
          false

        case _ if query.isCancelled => false

        case _ => true
      }
      .mapEval {
        case JobStartSuccess(jobId) =>
          builder.startSubQuery(jobId, query.text, Batch(Nil))

        case JobStartFailure(exception) =>
          builder.error(query.id, exception)

        case JobEndSuccess(jobId) =>
          builder.endSubQuery(jobId)

        case ProcessStdOutLine(jobId, line) =>
          builder.log(jobId, line, "INFO")

        case ProcessStdErrLine(jobId, line) =>
          builder.log(jobId, line, "ERROR")

        case ProcessFields(jobId, fields) =>
          builder.addSubQuery(jobId, Batch(Nil, columns = Option(fields.map(BatchColumn))))

        case ProcessRow(jobId, row) =>
          builder.addSubQuery(jobId, Batch(Seq(row)))
        case event =>
          Task(logger.info(s"method=run event=unknown-even query-id=${query.id} user=${query.user.email} event=$event"))
      }.lastL
  }

  override def runTask(query: ActiveQuery[String], builder: Builder[String, Batch]): Task[Unit] = {
    makeProcess(query)
      .bracket(process => run(process, query, builder))(_.close)
  }
}
