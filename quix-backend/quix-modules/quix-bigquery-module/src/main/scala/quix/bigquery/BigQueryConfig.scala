package quix.bigquery

case class BigQueryConfig(confType: String,
                          projectId: String,
                          clientEmail: String,
                          clientId: String,
                          authUri: String,
                          tokenUri: String,
                          authProviderX509CertUrl: String,
                          clientX509CertUrl: String,
                          firstEmptyStateDelay: Long,
                          requestTimeout: Long,
                          privateKeyId: String = "",
                          privateKey: String = "") {
  override def toString: String = s"BigQueryConfig($confType,$projectId,$clientEmail,$clientId,$authUri,$tokenUri,$authProviderX509CertUrl,$clientX509CertUrl,$firstEmptyStateDelay,$requestTimeout ***, ***)"
}

