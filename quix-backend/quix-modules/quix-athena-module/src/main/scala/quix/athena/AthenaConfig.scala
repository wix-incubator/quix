package quix.athena

case class AthenaConfig(output: String, region: String, database: String, firstEmptyStateDelay : Long, requestTimeout : Long)
