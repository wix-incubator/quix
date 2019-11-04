package quix.web.auth

import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.Scope
import pdi.jwt.{Jwt, JwtAlgorithm}

class DemoUsersTest extends SpecWithJUnit {

  class ctx extends Scope {
    val users = new DemoUsers(new JwtUsers("header", "secret"))
  }

  "DemoUsers" should {
    "mask email" in new ctx {
      val header = Jwt.encode("""{"email":"user@quix.com"}""", "secret", JwtAlgorithm.HS256)

      users.auth(Map("header" -> header))(user => user.email) must_== "*******@quix.com"
    }
  }
}
