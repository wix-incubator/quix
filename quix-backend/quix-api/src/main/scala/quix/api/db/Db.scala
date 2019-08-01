package quix.api.db

import monix.eval.Task

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
  def getCatalogs: Task[List[Catalog]]

  def getAutocomplete: Task[Map[String, List[String]]]

  def getTable(catalog: String, schema: String, table: String): Task[Table]

  def search(query: String): Task[List[Catalog]]
}

trait Catalogs {
  def fast: Task[List[Catalog]]

  def full: Task[List[Catalog]]
}

trait Autocomplete {
  def fast: Task[Map[String, List[String]]]

  def full: Task[Map[String, List[String]]]
}

trait Tables {
  def get(catalog: String, schema: String, table: String): Task[Table]
}