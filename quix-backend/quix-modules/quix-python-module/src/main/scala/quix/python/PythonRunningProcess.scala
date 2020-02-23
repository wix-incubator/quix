package quix.python

import java.nio.file.{Files, Path, Paths}

import com.typesafe.scalalogging.LazyLogging
import com.zaxxer.nuprocess.NuProcess
import monix.eval.Task
import py4j.GatewayServer
import quix.core.utils.TaskOps._

/** Python Bridge is py4j bridge to connect between methods defined in quix.py and Quix execution model
 *
 * @param queryId       the queryId that started the execution
 * @param gatewayServer py4j instance for communication between python note and quix
 * @param bridge        py4j bridge that maps functions exposed in python to quix implementations
 * @param process       nuprocess instance that executes the python process
 * @param file          python code that contains all init quix code and actual python note content
 */
case class PythonRunningProcess(queryId: String, var gatewayServer: Option[GatewayServer] = None,
                                var bridge: Option[PythonBridge] = None,
                                var process: Option[NuProcess] = None,
                                var file: Option[Path] = None) extends LazyLogging {

  /**
   * Close all open resources and delete all temporary files
   *
   * @return
   */
  def close: Task[Unit] = {
    val task = for {
      _ <- Task(logger.info(s"method=close event=cleanup-start query-id=$queryId"))

      _ <- Task(gatewayServer.map(_.shutdown())).attempt
        .flatMap(_ => Task(this.gatewayServer = None))

      _ <- Task(process.map(_.destroy(true))).attempt
        .flatMap(_ => Task(this.process = None))

      _ <- Task(file.map(f => Files.deleteIfExists(Paths.get(f.getParent.toString, "quix.py")))).attempt

      _ <- Task(file.map(Files.deleteIfExists)).attempt

      _ <- Task(file.map(_.getParent).map(Files.deleteIfExists)).attempt
        .flatMap(_ => Task(this.file = None))
      _ <- Task(logger.info(s"method=close event=cleanup-done query-id=$queryId"))
    } yield ()

    task.logOnError(s"method=close event-cleanup-failure query-id=$queryId")
  }
}
