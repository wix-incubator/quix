package quix.web.controllers

import java.nio.charset.Charset
import java.util.concurrent._

import com.typesafe.scalalogging.LazyLogging
import javax.servlet.http.HttpServletResponse
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation._
import quix.api.execute._

@Controller
@RequestMapping(Array("/api"))
class DownloadController(val downloadableQueries: DownloadableQueries[String, Batch, ExecutionEvent]) extends LazyLogging {
  val charset = Charset.forName("UTF-8")

  @CrossOrigin(origins = Array("*"), allowedHeaders = Array("*"))
  @RequestMapping(value = Array("/download/{queryId}"), method = Array(RequestMethod.GET))
  def startDownload(@PathVariable queryId: String, response: HttpServletResponse) = {
    logger.info(s"event=download-start query-id=$queryId")

    response.setContentType("text/csv")
    response.setHeader("Vary", "Accept-Encoding")
    response.addHeader("Connection", "Keep-Alive")
    response.addHeader("Keep-Alive", "timeout=900")

    val outputStream = response.getOutputStream

    downloadableQueries.get(queryId) match {
      case Some(query) =>
        logger.info(s"event=download-start-trigger-execution query-id=$queryId")
        query.latch.countDown()

        while (query.isRunning) {
          val payload = query.results.poll(100, TimeUnit.MILLISECONDS)

          payload match {
            case DownloadableRow(values) =>
              val line = values.map(quote(_)).mkString(",").getBytes(charset)
              outputStream.write(line)
              outputStream.write('\n')

            case ErrorDuringDownload(message) =>
              outputStream.write(message.getBytes(charset))
              response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR)
            case _ =>

          }
        }

        downloadableQueries.remove(queryId)
      case None =>
        logger.info(s"event=download-not-found query-id=$queryId")
        response.setStatus(HttpServletResponse.SC_NOT_FOUND)
    }

    outputStream.close()
    logger.info(s"event=download-end query-id=$queryId")
  }

  def quote(data: Any): String = {
    val string = data match {
      case null => ""
      case "\"" =>
        // double quote should be escaped with another double quote
        // https://stackoverflow.com/questions/17808511/properly-escape-a-double-quote-in-csv
        "\"\""
      case list: List[_] => list.mkString(",")
      case _ => data.toString
    }
    "\"" + string + "\""
  }
}