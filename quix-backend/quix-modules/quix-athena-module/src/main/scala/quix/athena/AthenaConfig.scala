package quix.athena

case class AthenaConfig(output: String,
                        region: String,
                        database: String,
                        firstEmptyStateDelay : Long,
                        requestTimeout : Long,
                        accessKey : String = "",
                        secretKey : String = "") {
  override def toString: String = s"AthenaConfig($output,$region,$database,$firstEmptyStateDelay,$requestTimeout,****,***)"
}

