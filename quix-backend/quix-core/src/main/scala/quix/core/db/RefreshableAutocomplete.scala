package quix.core.db

import monix.eval.Task
import quix.api.db.Autocomplete

import scala.concurrent.duration._

class RefreshableAutocomplete(autocomplete: Autocomplete,
                              timeoutInMillis: Long,
                              staleThreshold: Long,
                              var state: State[Map[String, List[String]]] = State(Map.empty, 0L)) {
  def get: Task[Map[String, List[String]]] = {
    state match {
      case State(data, _) if data.isEmpty =>
        for {
          _ <- startUpdate()

          newCatalogs <-
          autocomplete.fast
            .flatMap(update)
            .timeout(timeoutInMillis.millis)
            .onErrorFallbackTo(Task.now(state.data))

          _ <- autocomplete.full
            .flatMap(update)
            .attempt.start
        } yield newCatalogs

      case State(_, expirationDate) if expirationDate < System.currentTimeMillis() =>
        for {
          _ <- startUpdate()
          _ <- autocomplete.full
            .flatMap(update)
            .attempt.start
        } yield state.data

      case _ => Task.now(state.data)
    }
  }

  def startUpdate() = {
    Task(state = state.copy(expirationDate = System.currentTimeMillis() + staleThreshold))
  }

  def update(newData: Map[String, List[String]]) = {
    Task {
      state = state.copy(data = newData)
      newData
    }
  }
}
