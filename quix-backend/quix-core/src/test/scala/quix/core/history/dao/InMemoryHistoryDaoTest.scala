package quix.core.history.dao

import java.time.Clock

import monix.eval.Task

class InMemoryHistoryDaoTest extends HistoryDaoContractTest {

  override def createDao(clock: Clock): Task[HistoryWriteDao with HistoryReadDao] =
    InMemoryHistoryDao.make(clock)

}
