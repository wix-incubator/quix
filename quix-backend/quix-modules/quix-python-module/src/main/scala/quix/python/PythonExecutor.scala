package quix.python

import java.nio.file.{Files, Path, Paths}

import com.google.common.io.Resources
import com.typesafe.scalalogging.LazyLogging
import com.zaxxer.nuprocess.NuProcessBuilder
import monix.eval.{Coeval, Task}
import monix.execution.Cancelable
import monix.execution.atomic.AtomicInt
import monix.reactive.Observable
import monix.reactive.observers.Subscriber
import py4j.GatewayServer
import quix.api.execute._
import quix.core.utils.TaskOps._

import scala.io.{BufferedSource, Source}

class PythonExecutor(config: PythonConfig = PythonConfig()) extends AsyncQueryExecutor[String, Batch] with LazyLogging {

  var port = AtomicInt(25333)

  def load(filename: String) = {
    val openFile = Coeval(Source.fromURL(Resources.getResource(filename)))
    val closeFile = (buffer: BufferedSource) => Coeval(buffer.close())
    val readFile = (buffer: BufferedSource) => Coeval(buffer.mkString.getBytes("UTF-8"))

    openFile.bracket(readFile)(closeFile).value()
  }

  def copy(dir: Path, filename: String) = {
    for {
      _ <- Task(if (Files.notExists(dir)) Files.createDirectories(dir))
      _ <- Task(Files.write(Paths.get(dir.toString, filename), load(filename)))
    } yield ()
  }

  def initVirtualEnv(dir: String, packages: Seq[String]) = {
    s"""
       |from packages import Packages
       |packages = Packages('$dir', '${config.indexUrl}', '${config.extraIndexUrl}')
       |packages.install(${packages.map(lib => ''' + lib + ''').mkString(", ")})
       |
       |""".stripMargin
  }

  def addQuix() = {
    s"""
       |from quix import Quix
       |
       |quix = Quix()
       |
       |""".stripMargin
  }

  def makeProcess(query: ActiveQuery[String]): Task[PythonRunningProcess] = {
    val packages = (Seq("py4j") ++ config.packages).distinct

    val task = for {
      process <- Task(PythonRunningProcess(query.id))

      dir = Paths.get(config.userScriptsDir, query.user.email)
      bin = Paths.get(dir.toString, "bin")
      _ <- Task(if (Files.notExists(dir)) Files.createDirectories(dir))
      _ <- Task(if (Files.notExists(bin)) Files.createDirectories(bin))

      file <- Task(Files.createTempFile(dir, "script-", ".py"))
      _ <- Task(process.file = Option(file))
      _ <- Task(logger.info(s"method=makeProcess event=setup-env packages=$packages query-id=${query.id} user=${query.user.email} file=$file"))
      script = initVirtualEnv(dir.toString, packages) + addQuix() + query.text
      _ <- Task(Files.write(file, script.getBytes("UTF-8")))
      _ <- Task(logger.info(s"method=makeProcess event=create-file file=$file query=$script query-id=${query.id} user=${query.user.email}"))

      _ <- copy(dir, "quix.py")
      _ <- copy(dir, "packages.py")
      _ <- copy(bin, "activator.py")

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

  private def extractRequestedPackages(query: ActiveQuery[String]): Seq[String] = {
    query.session.get("packages").collect {
      case items: Seq[String] => items
      case items: String => items.split(",").toList
    }.getOrElse(Nil).filter(_.trim.nonEmpty).distinct
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
        process.process = Some(pb.start())
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
          Task(logger.info(s"method=run event=unknown-event query-id=${query.id} user=${query.user.email} event=$event"))
      }.lastL
  }

  override def runTask(query: ActiveQuery[String], builder: Builder[String, Batch]): Task[Unit] = {
    makeProcess(query)
      .bracket(process => run(process, query, builder))(_.close)
  }
}
