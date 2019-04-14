package quix.api.db

sealed case class Catalog(name: String,
                          children: List[Schema],
                          `type`: String = "catalog")

sealed case class Schema(name: String,
                         children: List[Table],
                         `type`: String = "schema")

sealed case class Table(name: String,
                        children: List[Kolumn],
                        `type`: String = "table")

sealed case class Kolumn(name: String,
                         dataType: String,
                         `type`: String = "column")

trait Db {
  def catalogs: List[Catalog]

  def table(catalog: String, schema: String, table: String): Table
}