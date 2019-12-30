package quix.core.history.dao

import java.time.{Clock, ZoneOffset}

import monix.eval.Task
import quix.core.history.dao.HistoryDaoContractTest._

class InMemoryHistoryDaoTest extends HistoryDaoContractTest {

  override def createDao: Task[HistoryWriteDao with HistoryReadDao] =
    InMemoryHistoryDao.make(Clock.fixed(now, ZoneOffset.UTC))

}
