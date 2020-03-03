package quix.api.v2.execute

import java.util.UUID

import monix.execution.atomic.Atomic
import quix.api.v1.users.User

trait SubQuery {
  def id: String

  def text: String

  def session: Session

  def user: User

  def canceled: Atomic[Boolean]
}

case class ImmutableSubQuery(text: String, user: User,
                             canceled: Atomic[Boolean] = Atomic(false),
                             id: String = UUID.randomUUID().toString,
                             session: Session = new MutableSession) extends SubQuery

case class Query(subQueries: Seq[SubQuery], id: String = UUID.randomUUID().toString, canceled: Atomic[Boolean] = Atomic(false))