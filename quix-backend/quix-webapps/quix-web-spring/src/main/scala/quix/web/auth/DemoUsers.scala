package quix.web.auth

import quix.api.v1.users.{User, Users}

class DemoUsers(users : Users) extends Users  {
  override def auth[T](headers: Map[String, String])(code: User => T): T = {
    users.auth(headers) { user =>
      val domain = user.email.split("@").lastOption.getOrElse("***")
      code(user.copy(email = "*******@" + domain))
    }
  }
}
