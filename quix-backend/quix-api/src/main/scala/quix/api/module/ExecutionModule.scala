package quix.api.module

import monix.eval.Task
import quix.api.db.Db
import quix.api.execute.{Builder, StartCommand}
import quix.api.users.User

/** Every quix note type must implement ExecutionModule to support query execution and db tree exploration
 *
 * @tparam Code
 * @tparam Results
 */
trait ExecutionModule[Code, Results] {

  /** Describes execution of code passed via [[quix.api.execute.StartCommand]] and invocations
   * of [[quix.api.execute.Builder]] methods.
   *
   * @param command includes the code that must be executed. Might contains multiple statements
   * @param id      query id
   * @param user    user that asked to execute command
   * @param builder instance of [[quix.api.execute.Builder]] that serves as communication channel to quix frontend
   * @return description of execution by means of [[monix.eval.Task]]
   */
  def start(command: StartCommand[Code], id: String, user: User, builder: Builder[Code, Results]): Task[Unit]

  /** Execution module might expose db tree that can be visualized and explored in quix frontend
   *
   * @return optional instance of db
   */
  def db: Option[Db]
}