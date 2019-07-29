package quix.core.db

case class State[T](data: T, expirationDate: Long)