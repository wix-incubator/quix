package quix.web.auth

import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.Scope
import pdi.jwt.{Jwt, JwtAlgorithm}
import quix.api.v1.users.RequestNotAuthenticated

class JwtUsersTest extends SpecWithJUnit {

  class ctx extends Scope {
    val users = new JwtUsers("header", "secret")
  }

  "JwtUsers" should {
    "throw an exception if header is missing" in new ctx {
      users.auth(Map.empty)(_ => "OK") must throwA[RequestNotAuthenticated]
    }

    "throw an exception if header can't be decoded" in new ctx {
      users.auth(Map("header" -> "foo"))(_ => "OK") must throwA[RequestNotAuthenticated]
    }

    "throw an exception if payload can't be read into User class" in new ctx {
      val header = Jwt.encode("""bad payload""", "secret", JwtAlgorithm.HS256)

      users.auth(Map("header" -> header))(_ => "OK") must throwA[RequestNotAuthenticated]
    }

    "evaluate code block is header is encoded and decoded correctly" in new ctx {
      val header = Jwt.encode("""{"email":"user@quix"}""", "secret", JwtAlgorithm.HS256)

      users.auth(Map("header" -> header))(_ => "OK") must_== "OK"
    }
  }
}
