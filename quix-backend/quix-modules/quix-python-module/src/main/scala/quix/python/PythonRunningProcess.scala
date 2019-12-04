package quix.python

import java.nio.file.{Files, Path, Paths}

import com.typesafe.scalalogging.LazyLogging
import com.zaxxer.nuprocess.NuProcess
import monix.eval.Task
import py4j.GatewayServer
import quix.core.utils.TaskOps._

case class PythonRunningProcess(queryId: String, var gatewayServer: Option[GatewayServer] = None,
                                var bridge: Option[PythonBridge] = None,
                                var process: Option[NuProcess] = None,
                                var file: Option[Path] = None) extends LazyLogging {
  def close: Task[Unit] = {
    val task = for {
      _ <- Task(logger.info(s"method=close event=cleanup-start query-id=$queryId"))

      _ <- Task(gatewayServer.map(_.shutdown())).attempt
        .flatMap(_ => Task(gatewayServer = None))

      _ <- Task(process.map(_.destroy(true))).attempt
        .flatMap(_ => Task(process = None))

      _ <- Task(file.map(f => Files.deleteIfExists(Paths.get(f.getParent.toString, "quix.py")))).attempt

      _ <- Task(file.map(Files.deleteIfExists)).attempt

      _ <- Task(file.map(_.getParent).map(Files.deleteIfExists)).attempt
        .flatMap(_ => Task(file = None))
      _ <- Task(logger.info(s"method=close event=cleanup-done query-id=$queryId"))
    } yield ()

    task.logOnError(s"method=close event-cleanup-failure query-id=$queryId")
  }
}
