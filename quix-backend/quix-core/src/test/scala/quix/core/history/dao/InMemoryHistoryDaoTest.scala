package quix.core.history.dao

import java.time.Clock

import cats.effect.Resource
import monix.eval.Task

class InMemoryHistoryDaoTest extends HistoryDaoContractTest {

  override def createDao(clock: Clock): Resource[Task, HistoryWriteDao with HistoryReadDao] =
    Resource.liftF(InMemoryHistoryDao.make(clock))

}
