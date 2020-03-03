package quix.api.v2.execute

trait Session {
  def put(key: String, value: String)

  def remove(key: String)

  def get: Map[String, String]
}

class MutableSession(private var state: Map[String, String] = Map.empty) extends Session {
  override def put(key: String, value: String): Unit = state = state.updated(key, value)

  override def remove(key: String): Unit = state = state - key

  override def get: Map[String, String] = state
}

class SessionWithMore(delegate: Session, more: () => Map[String, String]) extends Session {
  override def put(key: String, value: String): Unit = delegate.put(key, value)

  override def remove(key: String): Unit = delegate.remove(key)

  override def get: Map[String, String] = delegate.get ++ more()
}

object MutableSession {
  def apply(kv: (String, String)*): MutableSession = new MutableSession(kv.toMap)
}