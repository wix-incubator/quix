package quix.presto.rest

import org.specs2.matcher.MustMatchers
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.Scope
import quix.api.v1.users.User
import quix.api.v2.execute.{ImmutableSubQuery, MutableSession}
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
      request.headers must contain("X-Presto-User" -> query.user.email)
    }

    // https://github.com/prestodb/presto/wiki/HTTP-Protocol
    "add custom query session params as single comma-separated x-presto-session http header" in new ctx {
      val queryWithSession = query.copy(session = MutableSession("foo" -> "1", "bar" -> "2"))
      val request = factory.buildInitRequest(queryWithSession, config)

      request.method must_=== "POST"
      request.headers must contain("X-Presto-Session" -> "foo=1, bar=2")
    }

    "use catalog/schema from active query" in new ctx {
      val queryWithCatalogs = query.copy(session = MutableSession("X-Presto-Catalog" -> "catalog", "X-Presto-Schema" -> "schema"))
      val request = factory.buildInitRequest(queryWithCatalogs, config)

      request.headers must contain("X-Presto-Catalog" -> "catalog")
      request.headers must contain("X-Presto-Schema" -> "schema")
    }

    "fallback to default catalog/schema values from config if missing in active query" in new ctx {
      val request = factory.buildInitRequest(query, config)

      request.headers must contain("X-Presto-Catalog" -> "default-catalog")
      request.headers must contain("X-Presto-Schema" -> "default-schema")
    }
  }

}
