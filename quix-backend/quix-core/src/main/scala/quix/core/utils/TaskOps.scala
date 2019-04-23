package quix.core.utils

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task

import scala.concurrent.duration.FiniteDuration

object TaskOps extends LazyLogging {

  implicit class Ops[A](val task: Task[A]) extends AnyVal {
    def retry(maxRetries: Int, firstDelay: FiniteDuration): Task[A] = {
      task.onErrorHandleWith {
        case ex: Exception =>
          if (maxRetries > 0) {
            logger.warn(s"method=retry error=${ex.getClass.getSimpleName} retries=$maxRetries delay=${firstDelay.toMillis / 1000.0}")
            retry(maxRetries - 1, firstDelay * 2).delayExecution(firstDelay)
          }
          else
            Task.raiseError(ex)
      }
    }

    def logOnError(msg: String = ""): Task[A] = {
      task.onErrorHandleWith {
        case e: Exception =>
          logger.error(msg, e)
          Task.raiseError(e)
      }
    }
  }
}
