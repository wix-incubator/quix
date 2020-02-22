package quix.jdbc

import com.typesafe.scalalogging.LazyLogging
import com.wix.mysql.EmbeddedMysql
import com.wix.mysql.EmbeddedMysql.anEmbeddedMysql
import com.wix.mysql.ScriptResolver.classPathScript
import com.wix.mysql.config.Charset.UTF8
import com.wix.mysql.config.MysqldConfig
import com.wix.mysql.config.MysqldConfig.aMysqldConfig
import com.wix.mysql.distribution.Version.v5_6_23

object EmbeddedMysqlDb extends LazyLogging {
  val config: MysqldConfig = aMysqldConfig(v5_6_23)
    .withCharset(UTF8)
    .withPort(2215)
    .withUser("wix", "wix")
    .build()

  var db: EmbeddedMysql = _

  def reloadSchema = {
    logger.info("method=reloadSchema")
    db.reloadSchema("aschema", classPathScript("db/001_init.sql"))
  }

  def stop = {
    logger.info("method=stop")
    db.stop()
  }

  def start = {
    logger.info("method=start")
    db = anEmbeddedMysql(config)
      .addSchema("aschema", classPathScript("db/001_init.sql"))
      .start()
  }
}
