package quix.presto

case class PrestoConfig(statementsApi: String, healthApi: String, queryInfoApi: String, schema: String, catalog: String, source: String)