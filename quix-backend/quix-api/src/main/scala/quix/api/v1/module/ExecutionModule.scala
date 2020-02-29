package quix.api.v1.module

import monix.eval.Task
import quix.api.v1.db.Db
import quix.api.v1.execute.{Builder, StartCommand}
import quix.api.v1.users.User

/** Every quix note type must implement ExecutionModule to support query execution and db tree exploration
 *
 * @tparam Code
 * @tparam Results
 */
trait ExecutionModule[Code, Results] {

  /** Describes execution of code passed via [[quix.api.v1.execute.StartCommand]] and invocations
   * of [[quix.api.v1.execute.Builder]] methods.
   *
   * @param command includes the code that must be executed. Might contains multiple statements
   * @param id      query id
   * @param user    user that asked to execute command
   * @param builder instance of [[quix.api.v1.execute.Builder]] that serves as communication channel to quix frontend
   * @return description of execution by means of [[monix.eval.Task]]
   */
  def start(command: StartCommand[Code], id: String, user: User, builder: Builder[Code, Results]): Task[Unit]

  /** Execution module might expose db tree that can be visualized and explored in quix frontend
   *
   * @return optional instance of db
   */
  def db: Option[Db]
}