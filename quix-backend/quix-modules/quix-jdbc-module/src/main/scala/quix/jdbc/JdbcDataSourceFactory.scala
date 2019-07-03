package quix.jdbc

import org.springframework.jdbc.datasource.DriverManagerDataSource

//import com.mysql.jdbc.jdbc2.optional.MysqlDataSource

object JdbcDataSourceFactory {
  def getMySQLDataSource(url: String, userName: String, password: String): DriverManagerDataSource = {
    var mysqlDS = new DriverManagerDataSource(url, userName, password)
    mysqlDS
  }
}
