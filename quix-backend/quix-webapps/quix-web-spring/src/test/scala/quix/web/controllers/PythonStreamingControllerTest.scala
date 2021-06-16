package quix.web.controllers

import com.google.common.io.Resources
import com.typesafe.scalalogging.LazyLogging
import quix.web.E2EContext

class PythonStreamingControllerTest extends E2EContext with LazyLogging {

  "PythonStreamingController" should {
    "pass sanity" in {
      val quix = Resources.getResource("quix.py")
      val activator = Resources.getResource("activator.py")
      val packages = Resources.getResource("packages.py")

      println(quix)
      println(activator)
      println(packages)

      val listener = execute("print(123)", module = "snake")

      listener.messages must containEvent("""{"event":"start","data":{"id":"query-id","numOfQueries":1}}""")
      listener.messages must containEvent("""{"event":"log","data":{"id":"query-id","line":"123","level":"INFO"}}""")
      listener.messages must containEvent("""{"event":"end","data":{"id":"query-id"}}""")
    }

    "install and use custom module" in {
      val listener = execute(sql =
        """packages.install('numpy')
          |
          |import numpy as np
          |a = np.arange(6)
          |print(a)
          |""".stripMargin, module = "snake")

      listener.messages must containEvent("""{"event":"start","data":{"id":"query-id","numOfQueries":1}}""")
      listener.messages must containEvent("""{"event":"log","data":{"id":"query-id","line":"[0 1 2 3 4 5]","level":"INFO"}}""")
      listener.messages must containEvent("""{"event":"end","data":{"id":"query-id"}}""")
    }
  }


}
