package quix.core.db

import org.specs2.matcher.MustMatchers
import org.specs2.mutable.SpecWithJUnit
import quix.api.db.{Catalog, Kolumn, Schema, Table}

class DbOpsTest extends SpecWithJUnit with MustMatchers  {

  "DbOps.mergeNewAndOldCatalogs" should {

    "pass sanity if no change was detected" in {
      val columns: List[Kolumn] = List(Kolumn("uuid", "guid"))
      val tables: List[Table] = List(Table("users", columns))
      val schemas: List[Schema] = List(Schema("dbo", tables))
      val newCatalogs = List(Catalog("bi", schemas))
      val oldCatalogs = List(Catalog("bi", schemas))

      val mergedResult = DbOps.mergeNewAndOldCatalogs(newCatalogs, oldCatalogs)

      mergedResult must_=== newCatalogs
    }

    "swap old catalogs with new catalogs if tables were added" in {
      val columns: List[Kolumn] = List(Kolumn("uuid", "guid"))
      val nonEmptyTables: List[Table] = List(Table("users", columns))
      val emptyTables: List[Table] = List.empty[Table]
      val newCatalogs = List(Catalog("bi", List(Schema("dbo", nonEmptyTables))))
      val oldCatalogs = List(Catalog("bi", List(Schema("dbo", emptyTables))))

      val mergedResult = DbOps.mergeNewAndOldCatalogs(newCatalogs, oldCatalogs)

      mergedResult must_=== newCatalogs
    }

    "swap old catalogs with new catalogs if tables were removed" in {
      val columns: List[Kolumn] = List(Kolumn("uuid", "guid"))
      val nonEmptyTables: List[Table] = List(Table("users", columns))
      val emptyTables: List[Table] = List.empty[Table]
      val newCatalogs = List(Catalog("bi", List(Schema("dbo", emptyTables))))
      val oldCatalogs = List(Catalog("bi", List(Schema("dbo", nonEmptyTables))))

      val mergedResult = DbOps.mergeNewAndOldCatalogs(newCatalogs, oldCatalogs)

      mergedResult must_=== newCatalogs
    }

    "not swap old catalogs with new catalogs if schemas were removed" in {
      val columns: List[Kolumn] = List(Kolumn("uuid", "guid"))
      val nonEmptyTables: List[Table] = List(Table("users", columns))
      val newCatalogs = List(Catalog("bi", List.empty[Schema]))
      val oldCatalogs = List(Catalog("bi", List(Schema("dbo", nonEmptyTables))))

      val mergedResult = DbOps.mergeNewAndOldCatalogs(newCatalogs, oldCatalogs)

      mergedResult must_=== oldCatalogs
    }

  }

  "DbOps.search" should {
    "pass sanity" in {
      DbOps.search(List.empty, "foo") must beEmpty
    }

    "in case of catalog match, it should return the whole catalog including schemas and tables in case of a match" in {
      val first = Catalog("this-is-foo-catalog", List(Schema("this-is-boo-schema", Nil)))
      val second = Catalog("this-is-boo-catalog", List(Schema("this-is-boo-schema", Nil)))

      val expected = List(first)

      DbOps.search(List(first, second), "foo") must_=== expected
    }

    "in case of schema match, it should return the catalog including only matched schemas and all tables of those schemas" in {
      val first = Schema("this-is-foo-schema", List(Table("this-is-boo-table", Nil)))
      val second = Schema("this-is-boo-schema", List(Table("this-is-boo-table", Nil)))

      val catalog = Catalog("catalog", List(first, second))
      val expected = Catalog("catalog", List(first))

      DbOps.search(List(catalog), "foo") must contain(expected)
    }

    "in case of table match, it should return the whole catalog+schema tree for that table" in {
      val first = Table("this-is-foo-table", Nil)
      val second = Table("this-is-boo-table", Nil)

      val catalog = Catalog("catalog", List(Schema("schema", List(first, second))))
      val expected = Catalog("catalog", List(Schema("schema", List(first))))

      DbOps.search(List(catalog), "foo") must contain(expected)
    }
  }

}
