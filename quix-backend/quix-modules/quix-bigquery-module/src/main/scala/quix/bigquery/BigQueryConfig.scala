package quix.bigquery

case class BigQueryConfig(credentialBytes: Array[Byte],
                          firstEmptyStateDelay: Long,
                          requestTimeout: Long)

