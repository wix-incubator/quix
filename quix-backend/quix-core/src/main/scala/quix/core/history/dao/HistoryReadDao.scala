package quix.core.history.dao

import monix.eval.Task
import quix.core.history.{Execution, ExecutionStatus}

trait HistoryReadDao {
  def executions(filter: Filter = Filter.None,
                 sort: Sort = Sort.Default,
                 page: Page = Page.First): Task[List[Execution]]
}

sealed trait Filter

object Filter {
  case object None extends Filter
  case class Status(status: ExecutionStatus) extends Filter
}

case class Sort(by: SortField, order: SortOrder)

object Sort {
  val Default = Sort(SortField.StartTime, SortOrder.Descending)
}

sealed trait SortField

object SortField {
  case object StartTime extends SortField
}

sealed trait SortOrder

object SortOrder {
  case object Ascending extends SortOrder
  case object Descending extends SortOrder
}

trait Page {
  def offset: Int
  def limit: Int
}

object Page {
  val DefaultLimit = 20
  val MaxLimit = 1000
  val First = Page(0, DefaultLimit)

  def apply(offset: Int, limit: Int): Page = {
    val offset1 = offset max 0
    val limit1 = limit min MaxLimit
    new Page {
      override val offset: Int = offset1
      override val limit: Int = limit1
    }
  }
}
