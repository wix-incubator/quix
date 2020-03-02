package quix.presto.rest

import monix.eval.Task
import quix.api.v2.execute.SubQuery

trait PrestoStateClient {

  def init(query: SubQuery): Task[PrestoState]

  def advance(uri: String): Task[PrestoState]

  def close(state: PrestoState): Task[Unit]

  def info(state: PrestoState): Task[PrestoQueryInfo]

  def health(): Task[PrestoHealth]
}
