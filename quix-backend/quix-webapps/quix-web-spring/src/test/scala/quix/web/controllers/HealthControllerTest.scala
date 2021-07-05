package quix.web.controllers

import quix.web.E2EContext

class HealthControllerTest extends E2EContext {

  "HealthController" should {
    "return 200 with empty body after start" in {
      val health = getResponse("/health/is_alive")

      health.code must_=== (200)
      health.body must_=== ""
    }
  }
}


