package quix.web.controllers

import java.io.{Closeable, OutputStream}

import com.google.common.io.ByteStreams
import com.typesafe.scalalogging.LazyLogging
import javax.servlet.http.HttpServletResponse
import monix.eval.Task
import monix.execution.Scheduler.Implicits.global
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation._
import quix.core.download.QueryResultsStorage

@Controller
@RequestMapping(Array("/api"))
class DownloadController(val results: QueryResultsStorage) extends LazyLogging {

  @CrossOrigin(origins = Array("*"), allowedHeaders = Array("*"))
  @RequestMapping(value = Array("/download/{queryId}"), method = Array(RequestMethod.GET))
  def startDownload(@PathVariable queryId: String, response: HttpServletResponse): Unit = {
    logger.info(s"event=download-start query-id=$queryId")

    val task = results.exists(queryId).flatMap {
      case false =>
        Task(response.setStatus(404))
      case true =>
        val responseUpdateTask = Task {
          response.setContentType("text/csv")
          response.setHeader("Vary", "Accept-Encoding")
          response.addHeader("Connection", "Keep-Alive")
          response.addHeader("Keep-Alive", "timeout=900")
        }

        val openOutput = Task(response.getOutputStream)
        val openInput = results.getInputStream(queryId)
        val closeStream = (stream: Closeable) => Task(stream.close())

        val useOutput = (stream: OutputStream) => {
          openInput
            .bracket(data => Task(ByteStreams.copy(data, stream)))(closeStream)
        }

        val deleteFile = results.delete(queryId)

        responseUpdateTask >> openOutput.bracket(useOutput)(closeStream) >> deleteFile
    }

    task.runSyncUnsafe()
  }
}
