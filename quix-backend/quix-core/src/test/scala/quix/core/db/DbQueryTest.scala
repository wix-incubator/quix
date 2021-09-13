package quix.core.db

import org.specs2.mutable.SpecWithJUnit

class DbQueryTest extends SpecWithJUnit {

  "DbQuery.apply" should {
    "return exact match query for quoted strings" in {
      DbQuery(""""foo"""").matches("foo") must beTrue
      DbQuery("""'foo'""").matches("foo") must beTrue
    }

    "return contains query regular strings" in {
      DbQuery("foo").matches("foo") must beTrue
      DbQuery("").matches("foo") must beTrue
    }

    "handle nulls" in {
      DbQuery(null).matches("foo") must beFalse
    }
  }

}
