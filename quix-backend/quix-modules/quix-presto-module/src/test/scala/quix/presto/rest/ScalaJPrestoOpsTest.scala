package quix.presto.rest

import org.specs2.matcher.MustMatchers
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.Scope
import quix.api.v1.users.User
import quix.api.v2.execute.ImmutableSubQuery
import quix.presto.PrestoConfig

import scala.collection.mutable

class ScalaJPrestoOpsTest extends SpecWithJUnit with MustMatchers {

  class ctx extends Scope {
    var factory = ScalaJPrestoOps
    val query = ImmutableSubQuery("select 1", User("user@quix"))
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
      val queryWithSession = query.copy(session = mutable.Map("foo" -> "1", "bar" -> "2"))
      val request = factory.buildInitRequest(queryWithSession, config)

      request.method must_=== "POST"
      request.headers must contain("x-presto-session" -> "foo=1, bar=2")
    }

    "use catalog/schema from active query" in new ctx {
      val queryWithCatalogs = query.copy(session = mutable.Map("x-presto-catalog" -> "catalog", "x-presto-schema" -> "schema"))
      val request = factory.buildInitRequest(queryWithCatalogs, config)

      request.headers must contain("x-presto-catalog" -> "catalog")
      request.headers must contain("x-presto-schema" -> "schema")
    }

    "fallback to default catalog/schema values from config if missing in active query" in new ctx {
      val request = factory.buildInitRequest(query, config)

      request.headers must contain("x-presto-catalog" -> "default-catalog")
      request.headers must contain("x-presto-schema" -> "default-schema")
    }
  }

}
