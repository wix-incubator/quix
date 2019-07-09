package quix.jdbc

import org.springframework.jdbc.datasource.DriverManagerDataSource


object JdbcDataSourceFactory {
  def getDriverDataSource(url: String, userName: String, password: String): DriverManagerDataSource = {
    var mysqlDS = new DriverManagerDataSource(url, userName, password)
    mysqlDS
  }
}
