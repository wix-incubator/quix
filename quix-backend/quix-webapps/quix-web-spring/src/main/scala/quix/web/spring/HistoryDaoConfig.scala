package quix.web.spring

import java.time.Clock

import com.typesafe.scalalogging.LazyLogging
import monix.execution.Scheduler.Implicits.global
import org.springframework.context.annotation.{Bean, Configuration}
import quix.core.history.dao.InMemoryHistoryDao

@Configuration
class HistoryDaoConfig extends LazyLogging {

  @Bean def historyDao: InMemoryHistoryDao = {
    logger.info("event=[spring-config] bean=[InMemoryHistoryDao]")
    InMemoryHistoryDao.make(Clock.systemUTC()).runSyncUnsafe()
  }

}
