package quix.presto.db

import monix.eval.Task
import quix.api.db.Catalog
import quix.api.execute.{AsyncQueryExecutor, Batch}

import scala.concurrent.duration._

class PrestoAutocomplete(val catalogs: PrestoCatalogs,
                         val queryExecutor: AsyncQueryExecutor[String, Batch],
                         val timeout: Long, val stalePeriod: Long,
                         var state: State[Map[String, List[String]]] = State(Map.empty, 0L))
  extends SingleQueryExecutor {

  def get = {
    state match {
      case State(data, _) if data.isEmpty =>
        for {
          _ <- Task (state = state.copy(expirationDate = System.currentTimeMillis() + stalePeriod))
          catalogsList <- catalogs.get
          autocomplete <- singleQueryAutocomplete(catalogsList)
            .timeout(timeout.millis)
            .flatMap(update)
            .onErrorFallbackTo(Task(Map.empty[String, List[String]]))

        } yield autocomplete

      case State(_, expirationDate) if expirationDate < System.currentTimeMillis() =>
        for {
          _ <- Task (state = state.copy(expirationDate = System.currentTimeMillis() + stalePeriod))
          _ <- {
            for {
              catalogsList <- catalogs.get
              _ <- singleQueryAutocomplete(catalogsList)
                .flatMap(update)
                .attempt.start
            } yield ()
          }
        } yield state.data

      case _ => Task.now(state.data)
    }
  }

  def update(autocomplete: Map[String, List[String]]): Task[Map[String, List[String]]] = Task {
    if (autocomplete.nonEmpty) {
      state = state.copy(data = autocomplete)
    }

    autocomplete
  }

  def singleQueryAutocomplete(catalogList: List[Catalog]) = {
    for {
      catalogs <- Task.now(catalogList.map(_.name))
      schemas <- Task.now(catalogList.flatMap(_.children.map(_.name)))
      tables <- Task.now(catalogList.flatMap(_.children.flatMap(_.children.map(_.name))))
      columns <- executeForSingleColumn("select distinct column_name from system.jdbc.columns")
        .onErrorFallbackTo(Task(List.empty[String]))
    } yield Map("catalogs" -> catalogs, "schemas" -> schemas, "tables" -> tables, "columns" -> columns)
  }

}
