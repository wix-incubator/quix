package quix.web.auth

import pdi.jwt.{Jwt, JwtAlgorithm}
import quix.api.v1.users.{RequestNotAuthenticated, User, Users}
import quix.core.utils.JsonOps.Implicits.global
import quix.core.utils.StringJsonHelpersSupport

import scala.util.Try

class JwtUsers(val headerName: String, val secret: String)
  extends Users with StringJsonHelpersSupport {

  override def auth[T](headers: Map[String, String])(code: User => T): T = {
    val result = for {
      header <- headers.get(headerName)
      userJson <- Jwt.decodeRaw(header, secret, Seq(JwtAlgorithm.HS256)).toOption
      user <- Try(userJson.as[User]).toOption
    } yield code(user)

    result.getOrElse(throw RequestNotAuthenticated("Request not authenticated"))
  }
}
