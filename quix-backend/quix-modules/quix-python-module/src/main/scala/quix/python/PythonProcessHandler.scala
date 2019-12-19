package quix.python

import java.nio.ByteBuffer

import com.google.common.base.Charsets
import com.typesafe.scalalogging.LazyLogging
import com.zaxxer.nuprocess.{NuAbstractProcessHandler, NuProcess}
import monix.reactive.observers.Subscriber

class PythonProcessHandler(queryId: String, subscriber: Subscriber[PythonMessage])
  extends NuAbstractProcessHandler with LazyLogging {

  import ByteBufferUtils._
  var pid = 0L

  override def onStart(nuProcess: NuProcess): Unit = {
    pid = nuProcess.getPID
    logger.info(s"method=onStart query-id=$queryId pid=$pid")
    subscriber.onNext(ProcessStartSuccess(queryId))
  }

  override def onExit(statusCode: Int): Unit = {
    logger.info(s"method=onExit query-id=$queryId pid=$pid")
    subscriber.onNext(ProcessEndSuccess(queryId))
  }

  override def onStdout(buffer: ByteBuffer, closed: Boolean): Unit = {
    if (!closed) {
      for (line <- buffer.asLines()) {
        logger.info(s"method=onStdout query-id=$queryId pid=$pid line=${line.str}")
        subscriber.onNext(ProcessStdout(queryId, line.str))
      }
    }
  }

  override def onStderr(buffer: ByteBuffer, closed: Boolean): Unit = {
    if (!closed) {
      for (line <- buffer.asLines()) {
        logger.info(s"method=onStdErr pid=$pid line=${line.str}")
        subscriber.onNext(ProcessStderr(queryId, line.str))
      }
    }
  }
}

object ByteBufferUtils {

  implicit class ExtractLinesFromByteBuffer(val buf: ByteBuffer) extends AnyVal {
    def asLines(): Seq[Line] = {
      val arr = new Array[Byte](buf.limit())
      buf.get(arr)
      val str = new String(arr, Charsets.UTF_8)

      val lines = str
        .split('\n')
        .filter(_.trim.nonEmpty)

      lines match {
        case Array(single) if str.endsWith("\n") =>
          Array(Line(single))

        case Array(single) =>
          Array(Line(single, isPartial = true))

        case many if many.nonEmpty =>
          many.init.map(Line(_)) :+ Line(many.last, isPartial = true)

        case _ =>
          Seq.empty
      }
    }
  }

}