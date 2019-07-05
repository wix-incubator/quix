package quix.web

import com.wix.mysql.EmbeddedMysql
import com.wix.mysql.EmbeddedMysql.anEmbeddedMysql
import com.wix.mysql.ScriptResolver.classPathScript
import com.wix.mysql.config.Charset.UTF8
import com.wix.mysql.config.MysqldConfig
import com.wix.mysql.config.MysqldConfig.aMysqldConfig
import com.wix.mysql.distribution.Version.v5_6_23
import org.springframework.context.annotation.{Bean, Configuration, Import, Primary}
import quix.api.execute.Batch
import quix.api.module.ExecutionModule
import quix.jdbc.JdbcQuixModule
import quix.presto.PrestoQuixModule
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
