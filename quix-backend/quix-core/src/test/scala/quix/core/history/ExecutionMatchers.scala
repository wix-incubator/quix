package quix.core.history

import org.specs2.matcher.Matcher
import org.specs2.matcher.Matchers._

object ExecutionMatchers {
  def executionWithId(id: String): Matcher[Execution] =
    equalTo(id) ^^ ((_: Execution).id)

  def executionWithStatus(status: ExecutionStatus): Matcher[Execution] =
    equalTo(status) ^^ ((_: Execution).status)
}
