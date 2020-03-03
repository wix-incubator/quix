package quix.api.v2.execute

trait Session {
  def put(key: String, value: String)

  def remove(key: String)

  def get: Map[String, String]
}

class MutableSession(val session: () => Map[String, String] = () => Map.empty,
                     private var state: Map[String, String] = Map.empty) extends Session {
  override def put(key: String, value: String): Unit = state = state.updated(key, value)

  override def remove(key: String): Unit = state = state - key

  override def get: Map[String, String] = state
}

object MutableSession {
  def apply(kv: (String, String)*): MutableSession = new MutableSession(state = kv.toMap)

  def apply(session: () => Map[String, String]): MutableSession = new MutableSession(session = session)
}