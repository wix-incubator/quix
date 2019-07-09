package quix.web

import org.springframework.context.annotation.{Bean, Configuration, Import, Primary}
import quix.api.execute.Batch
import quix.api.module.ExecutionModule
import quix.jdbc.JdbcQuixModule
import quix.web.spring._

@Configuration
@Import(Array(
  classOf[SpringConfig]))
class JdbTestSpringConfig {

  @Bean
  @Primary
  def initModules: Map[String, ExecutionModule[String, Batch]] = {
    Map(
      "jdbc" -> JdbcQuixModule(MockBeans.queryExecutor),
    )
  }
}
