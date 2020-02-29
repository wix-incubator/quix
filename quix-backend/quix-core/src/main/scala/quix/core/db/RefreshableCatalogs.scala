package quix.core.db

import monix.eval.Task
import quix.api.v1.db.{Catalog, Catalogs}

import scala.concurrent.duration._

class RefreshableCatalogs(catalogs: Catalogs,
                          timeoutInMillis: Long,
                          staleThreshold: Long,
                          var state: State[List[Catalog]] = State(Nil, 0L)) {

  def get: Task[List[Catalog]] = {
    state match {
      case State(data, _) if data.isEmpty =>
        for {
          _ <- startUpdate()

          newCatalogs <-
          catalogs.fast
            .flatMap(update)
            .timeout(timeoutInMillis.millis)
            .onErrorFallbackTo(Task.now(state.data))

          _ <- catalogs.full
            .flatMap(update)
            .attempt.start
        } yield newCatalogs

      case State(_, expirationDate) if expirationDate < System.currentTimeMillis() =>
        for {
          _ <- startUpdate()
          _ <- catalogs.full
            .flatMap(update)
            .attempt.start
        } yield state.data

      case _ => Task.now(state.data)
    }
  }

  def startUpdate() = {
    Task(this.state = this.state.copy(expirationDate = System.currentTimeMillis() + staleThreshold))
  }

  def update(newCatalogs: List[Catalog]) = {
    Task {
      this.state = this.state.copy(data = newCatalogs)
      newCatalogs
    }
  }

}
