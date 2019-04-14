package quix.presto.rest

import java.util.UUID

import org.specs2.matcher.MustMatchers
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.Scope
import quix.api.execute.ActiveQuery
import quix.api.users.User
import quix.presto.PrestoConfig

class ScalaJPrestoOpsTest extends SpecWithJUnit with MustMatchers {

  class ctx extends Scope {
    var factory = ScalaJPrestoOps
    val queryId = UUID.randomUUID().toString
    val query = ActiveQuery(queryId, "select 1", 1, User("user@quix"), false, Map.empty)
    val config = PrestoConfig("statements", "health", "queryInfo", "default-schema", "default-catalog", "default-source")
  }

  "ScalaJPrestoOps.buildPrestoRequest" should {
    "construct the correct POST request for presto" in new ctx {
      val request = factory.buildInitRequest(query, config)

      request.method must_=== "POST"
      request.headers must contain("x-presto-user" -> query.user.email)
    }

    // https://github.com/prestodb/presto/wiki/HTTP-Protocol
    "add custom query session params as single comma-separated x-presto-session http header" in new ctx {
      val queryWithSession = query.copy(session = Map("foo" -> "1", "bar" -> "2"))
      val request = factory.buildInitRequest(queryWithSession, config)

      request.method must_=== "POST"
      request.headers must contain("x-presto-session" -> "foo=1, bar=2")
    }
  }

}
