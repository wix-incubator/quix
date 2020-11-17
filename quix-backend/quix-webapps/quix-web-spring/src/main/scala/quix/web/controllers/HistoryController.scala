package quix.web.controllers

import monix.execution.Scheduler.Implicits.global
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation._
import quix.core.history.Execution
import quix.core.history.dao.{Filter, HistoryReadDao, Page}

@Controller
@RequestMapping(Array("/api/history"))
class HistoryController(historyReadDao: HistoryReadDao) {

  @CrossOrigin(origins = Array("*"), allowedHeaders = Array("*"))
  @RequestMapping(value = Array("/executions"), method = Array(RequestMethod.GET))
  @ResponseBody
  def executions(@RequestParam(defaultValue = "0") offset: String,
                 @RequestParam(defaultValue = "20") limit: String,
                 @RequestParam(defaultValue = "") user : String,
                 @RequestParam(defaultValue = "") query : String
                ): List[ExecutionDto] =
    historyReadDao
      .executions(page = Page(offset.toInt, limit.toInt), filter = Filter(user, query))
      .runSyncUnsafe()
      .map(ExecutionDto(_))

}

case class ExecutionDto(id: String,
                        email: String,
                        query: Seq[String],
                        moduleType: String,
                        startedAt: String)

object ExecutionDto {
  def apply(execution: Execution): ExecutionDto =
    ExecutionDto(
      id = execution.id,
      email = execution.user.email,
      query = execution.statements,
      moduleType = execution.queryType,
      startedAt = execution.startedAt.toString)
}
