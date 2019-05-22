package quix.web.controllers

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.{RequestMapping, RequestMethod, ResponseBody}

@Controller
@RequestMapping(Array("/health"))
class HealthController {

  @RequestMapping(value = Array("/is_alive"), method = Array(RequestMethod.GET))
  @ResponseBody
  def isAlive = {}
}
