package quix.python

import java.nio.file.{Files, Path, Paths}

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

class PythonExecutor(config: PythonConfig = PythonConfig()) extends AsyncQueryExecutor[String, Batch] with LazyLogging {

  var port = AtomicInt(25333)

  def copy(dir: Path, filename: String): Task[Unit] = {
    for {
      bytes <- Task(Resources.toByteArray(Resources.getResource(filename)))
      _ <- Task(Files.write(Paths.get(dir.toString, filename), bytes))
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
       |try:
       |  from py4j.java_gateway import JavaGateway
       |except ImportError:
       |  import sys
       |  print("mandatory py4j package is missing, installing", file = sys.stderr)
       |  packages.install('py4j')
       |
       |from quix import Quix
       |
       |quix = Quix()
       |
       |""".stripMargin
  }

  def prepareFiles(process: PythonRunningProcess, query: ActiveQuery[String]): Task[Path] = {
    val dir = Paths.get(config.userScriptsDir, query.user.email)
    val bin = Paths.get(dir.toString, "bin")

    for {
      _ <- Task(if (Files.notExists(dir)) Files.createDirectories(dir))
      _ <- Task(if (Files.notExists(bin)) Files.createDirectories(bin))

      file <- Task(Files.createTempFile(dir, "script-", ".py"))
      script = initVirtualEnv(dir.toString, config.packages) + addQuix() + config.additionalCode + query.text
      _ <- Task(Files.write(file, script.getBytes("UTF-8")))

      _ <- copy(dir, "quix.py")
      _ <- copy(dir, "packages.py")
      _ <- copy(bin, "activator.py")

      _ <- Task(process.file = Some(file))
    } yield file
  }

  def prepareGateway(process: PythonRunningProcess, query: ActiveQuery[String]): Task[GatewayServer] = {
    for {
      bridge <- Task(new PythonBridge(query.id))
      _ <- Task(process.bridge = Some(bridge))

      gatewayServer <- Task(new GatewayServer(bridge, port.incrementAndGet()))
      _ <- Task(process.gatewayServer = Some(gatewayServer))
    } yield gatewayServer
  }

  def makeProcess(query: ActiveQuery[String]): Task[PythonRunningProcess] = {
    val process = PythonRunningProcess(query.id)

    for {
      _ <- prepareFiles(process, query)
      _ <- prepareGateway(process, query)
    } yield process
  }

  def run(process: PythonRunningProcess, query: ActiveQuery[String], builder: Builder[String, Batch]): Task[Unit] = {
    val observable = new Observable[PythonMessage] {
      override def unsafeSubscribeFn(subscriber: Subscriber[PythonMessage]): Cancelable = {
        val pb = new NuProcessBuilder("python3", "-W", "ignore",
          process.file.getOrElse(throw new IllegalStateException("No file to execute")).toString,
          process.gatewayServer.getOrElse(throw new IllegalStateException("No running gateway")).getPort.toString)
        val handler = new PythonProcessHandler(query.id, subscriber)
        pb.setProcessListener(handler)
        process.gatewayServer.foreach(_.start())
        process.process = Some(pb.start())

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
