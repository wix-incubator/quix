package quix.python

import java.nio.file.{Files, Path, Paths}

import com.typesafe.scalalogging.LazyLogging
import com.zaxxer.nuprocess.NuProcess
import monix.eval.Task
import py4j.GatewayServer

case class PythonRunningProcess(queryId: String, var gatewayServer: Option[GatewayServer] = None,
                                var bridge: Option[PythonBridge] = None,
                                var process: Option[NuProcess] = None,
                                var file: Option[Path] = None) extends LazyLogging {
  def close: Task[Unit] = {
    for {
      _ <- Task(logger.info(s"method=close event=cleanup-start query-id=${queryId}"))

      _ <- Task(gatewayServer.map(_.shutdown()))
        .flatMap(_ => Task(gatewayServer = None)).attempt

      _ <- Task(process.map(_.destroy(true)))
        .flatMap(_ => Task(process = None)).attempt

      _ <- Task(file.map(f => Files.deleteIfExists(Paths.get(f.getParent.toString, "quix.py"))))
      _ <- Task(file.map(Files.deleteIfExists)).attempt
      _ <- Task(file.map(_.getParent).map(Files.deleteIfExists))
        .flatMap(_ => Task(file = None)).attempt
    } yield ()
  }
}
