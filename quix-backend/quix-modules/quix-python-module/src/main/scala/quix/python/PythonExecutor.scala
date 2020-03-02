package quix.python

import java.nio.file.{Files, Path, Paths}

import com.google.common.io.Resources
import com.typesafe.scalalogging.LazyLogging
import com.zaxxer.nuprocess.NuProcessBuilder
import monix.eval.Task
import monix.execution.atomic.AtomicInt
import monix.reactive.{Observable, OverflowStrategy}
import py4j.GatewayServer
import quix.api.v1.execute._
import quix.api.v2.execute.{Builder, Executor, SubQuery}

class PythonExecutor(config: PythonConfig = PythonConfig()) extends Executor with LazyLogging {

  var port = AtomicInt(25333)

  def copy(dir: Path, filename: String): Task[Unit] = {
    for {
      bytes <- Task(Resources.toByteArray(Resources.getResource(filename)))
      _ <- Task(Files.write(Paths.get(dir.toString, filename), bytes))
    } yield ()
  }

  def execute(query: SubQuery, builder: Builder): Task[Unit] = {
    makeProcess(query)
      .bracket(process => run(process, query, builder))(_.close)
  }

  def makeProcess(query: SubQuery): Task[PythonRunningProcess] = {
    val process = PythonRunningProcess(query.id)

    for {
      _ <- prepareFiles(process, query)
      _ <- prepareGateway(process, query)
    } yield process
  }

  def prepareFiles(process: PythonRunningProcess, query: SubQuery): Task[Path] = {
    val user = query.user.email
    val dir = Paths.get(config.userScriptsDir, user)
    val bin = Paths.get(dir.toString, "bin")
    val script = generateUserScript(dir, query).getBytes("UTF-8")

    for {
      _ <- Task(if (Files.notExists(dir)) Files.createDirectories(dir))
      _ <- Task(if (Files.notExists(bin)) Files.createDirectories(bin))

      file <- Task(Files.createTempFile(dir, "script-", ".py"))

      _ <- Task(Files.write(file, script))

      _ <- copy(dir, "quix.py")
      _ <- copy(dir, "packages.py")
      _ <- copy(bin, "activator.py")

      _ <- Task(process.file = Some(file))
    } yield file
  }

  private def generateUserScript(dir: Path, query: SubQuery) = {
    val envSetup =
      s"""
         |from packages import Packages
         |packages = Packages('$dir', '${config.indexUrl}', '${config.extraIndexUrl}')
         |packages.install(${config.packages.map(lib => '\'' + lib + '\'').mkString(", ")})
         |
         |""".stripMargin

    val quixSetup =
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


    envSetup + quixSetup + config.additionalCode + query.text
  }

  def prepareGateway(process: PythonRunningProcess, query: SubQuery): Task[GatewayServer] = {
    for {
      bridge <- Task(new PythonBridge(query.id))
      _ <- Task(process.bridge = Some(bridge))

      gatewayServer <- Task(new GatewayServer(bridge, port.incrementAndGet()))
      _ <- Task(process.gatewayServer = Some(gatewayServer))
    } yield gatewayServer
  }

  def run(process: PythonRunningProcess, query: SubQuery, builder: Builder): Task[Unit] = {

    val pythonProcessMessages: Observable[PythonMessage] = Observable.create(OverflowStrategy.Unbounded) { sub =>
      val task = for {
        pb <- Task(new NuProcessBuilder("python3", "-W", "ignore",
          process.file.getOrElse(throw new IllegalStateException("No file to execute")).toString,
          process.gatewayServer.getOrElse(throw new IllegalStateException("No running gateway")).getPort.toString,
          query.id,
          query.user.email
        ))

        handler <- Task(new PythonProcessHandler(query.id, sub))
        _ <- Task(pb.setProcessListener(handler))
        _ <- Task(process.gatewayServer.foreach(_.start()))
        _ <- Task(process.process = Some(pb.start()))
      } yield ()

      task.runToFuture(sub.scheduler)
    }

    val quixInteropMessages: Observable[PythonMessage] = Observable.create(OverflowStrategy.Unbounded) { sub =>
      Task(process.bridge.foreach(_.register(sub))).runToFuture(sub.scheduler)
    }

    Observable(quixInteropMessages, pythonProcessMessages).merge
      .takeWhileInclusive {
        case ProcessEndSuccess(_) =>
          false

        case _ if query.canceled.get => false

        case _ => true
      }
      .mapEval {
        case ProcessStartFailure(exception) =>
          builder.error(query.id, exception)

        case ProcessStdout(jobId, line) =>
          builder.log(jobId, line, "INFO")

        case ProcessStderr(jobId, line) =>
          builder.log(jobId, line, "ERROR")

        case TabFields(tabId, fields) => {
          builder.startSubQuery(tabId, tabId)
          builder.addSubQuery(tabId, Batch(columns = Option(fields.map(BatchColumn))))
        }

        case TabRow(tabId, row) =>
          builder.addSubQuery(tabId, Batch(Seq(row)))

        case TabEnd(tabId) =>
          builder.endSubQuery(tabId, Map.empty)
        case event =>
          Task(logger.info(s"method=run event=unknown-event query-id=${query.id} user=${query.user.email} event=$event"))
      }.lastL
  }
}
