package quix.api.v1.users

sealed case class User(email: String, id: String = "")

trait Users {
  @throws[RequestNotAuthenticated]
  def auth[T](headers: Map[String, String])(code: User => T): T
}

class DummyUsers(val user: String) extends Users {
  override def auth[T](headers: Map[String, String])(code: User => T): T = code(User(user))
}

case class RequestNotAuthenticated(msg: String) extends RuntimeException(msg)