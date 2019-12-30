package quix.web.controllers

import com.wix.mysql.EmbeddedMysql
import com.wix.mysql.EmbeddedMysql.anEmbeddedMysql
import com.wix.mysql.ScriptResolver.classPathScript
import com.wix.mysql.config.Charset.UTF8
import com.wix.mysql.config.MysqldConfig
import com.wix.mysql.config.MysqldConfig.aMysqldConfig
import com.wix.mysql.distribution.Version.v5_6_23

object EmbeddedMySql {
  def create(port: Int, user: String, pass: String): EmbeddedMysql.Builder = {
    val config: MysqldConfig = aMysqldConfig(v5_6_23)
      .withCharset(UTF8)
      .withPort(port)
      .withUser(user, pass)
      .build()

    val embeddedServer: EmbeddedMysql.Builder = anEmbeddedMysql(config)
      .addSchema("aschema", classPathScript("db/001_init.sql"))

    embeddedServer
  }
}
