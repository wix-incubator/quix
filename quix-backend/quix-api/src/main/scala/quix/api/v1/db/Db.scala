package quix.api.v1.db

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

/** Db exposes database tree, supports autocomplete in quix editor and powers the DB search. */
trait Db {

  /** Supports up-to 4 levels of hierarchy : catalogs, schemas, tables and columns */
  def getCatalogs: Task[List[Catalog]]

  /** Returns list of all possible autocomplete items within different categories.
   * For example, in case of presto-module : catalogs, schemas, tables and columns.
   * */
  def getAutocomplete: Task[Map[String, List[String]]]

  /** Returns columns and types for a table identified by catalog, schema and table name */
  def getTable(catalog: String, schema: String, table: String): Task[Table]

  /** Returns list of catalogs filtered using a given substring */
  def search(query: String): Task[List[Catalog]]
}

/** Catalogs expose list of catalogs present within a module */
trait Catalogs {

  /** This method should return within under X milliseconds (configurable via .env) and will be called directly
   * from quix-frontend if db tree is empty */
  def fast: Task[List[Catalog]]

  /** This method isn't exposed to quix-frontend and will be called in background to cache the full db tree */
  def full: Task[List[Catalog]]
}

/** Autocomplete exposes list of categories and autocomplete items that belong to these categories.
 * For example, 'catalogs' might be a category and list of 'foo' and 'boo' might be catalogs
 * */
trait Autocomplete {
  def fast: Task[Map[String, List[String]]]

  def full: Task[Map[String, List[String]]]
}

/** Tables expose a way to get metadata of table */
trait Tables {

  /** This method will be called when user tries to expand a table in quix-frontend db tree */
  def get(catalog: String, schema: String, table: String): Task[Table]
}