package quix.presto.rest

import monix.eval.Task
import quix.api.v2.execute.SubQuery

trait PrestoStateClient {

  def init(query: SubQuery): Task[PrestoState]

  def advance(uri: String, query: SubQuery): Task[PrestoState]

  def close(state: PrestoState, query: SubQuery): Task[Unit]

  def info(state: PrestoState, query: SubQuery): Task[PrestoQueryInfo]

  def health(): Task[PrestoHealth]
}
