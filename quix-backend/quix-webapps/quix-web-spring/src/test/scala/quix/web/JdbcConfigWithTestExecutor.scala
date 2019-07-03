package quix.web

import com.wix.mysql.EmbeddedMysql
import com.wix.mysql.EmbeddedMysql.anEmbeddedMysql
import com.wix.mysql.ScriptResolver.classPathScript
import com.wix.mysql.config.Charset.UTF8
import com.wix.mysql.config.MysqldConfig
import com.wix.mysql.config.MysqldConfig.aMysqldConfig
import com.wix.mysql.distribution.Version.v5_6_23
import org.springframework.context.annotation.{Bean, Configuration, Import}
import quix.web.spring._

@Configuration
@Import(Array(classOf[JdbcTestSpringInitDbServerConfig],
  classOf[JdbcConfiguration],
  classOf[SpringConfig]))
class JdbTestSpringConfig {

}


@Configuration
class JdbcTestSpringInitDbServerConfig {
  @Bean def startTestServer: EmbeddedMysql = {
    val server = createEmbeddedMySqlServer()
    server.start()
  }

  def createEmbeddedMySqlServer() = {
    val config: MysqldConfig = aMysqldConfig(v5_6_23)
      .withCharset(UTF8)
      .withPort(2215)
      .withUser("wix", "wix")
      .build()

    val embeddedServer: EmbeddedMysql.Builder = anEmbeddedMysql(config)
      .addSchema("aschema", classPathScript("db/001_init.sql"))
    embeddedServer
  }
}

