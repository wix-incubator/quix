package quix.core.history

import java.time.Instant

import quix.api.v1.users.User

case class Execution(id: String,
                     queryType: String,
                     statements: Seq[String],
                     user: User,
                     startedAt: Instant,
                     status: ExecutionStatus)

sealed trait ExecutionStatus

object ExecutionStatus {
  case object Running extends ExecutionStatus
  case object Finished extends ExecutionStatus
  case object Failed extends ExecutionStatus
}
