package quix.jdbc

import org.springframework.jdbc.datasource.{DriverManagerDataSource, SimpleDriverDataSource}
import com.mysql.jdbc.Driver

//import com.mysql.jdbc.jdbc2.optional.MysqlDataSource

object JdbcDataSourceFactory {
  def getDriverDataSource(url: String, userName: String, password: String): SimpleDriverDataSource = {
    val driver = new Driver()
    var mysqlDS = new SimpleDriverDataSource(driver,url, userName, password)

    mysqlDS
  }
}
