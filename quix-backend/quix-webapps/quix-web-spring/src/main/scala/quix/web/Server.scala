package quix.web

import com.typesafe.scalalogging.LazyLogging
import org.springframework.boot._
import quix.web.spring.SpringConfig

object Server extends LazyLogging {
  def main(args: Array[String]): Unit = {
    logger.info("Starting Server")
    SpringApplication.run(classOf[SpringConfig], args: _*)
  }
}