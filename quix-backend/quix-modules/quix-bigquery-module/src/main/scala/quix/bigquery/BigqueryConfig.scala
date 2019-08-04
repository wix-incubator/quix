package quix.bigquery

case class BigqueryConfig(output: String,
                        region: String,
                        database: String,
                        firstEmptyStateDelay : Long,
                        requestTimeout : Long,
                        accessKey : String = "",
                        secretKey : String = "") {
  override def toString: String = s"BigqueryConfig($output,$region,$database,$firstEmptyStateDelay,$requestTimeout,****,***)"
}

