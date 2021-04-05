package quix.python

import java.util

import com.google.common.collect.Lists
import org.specs2.matcher.MustMatchers
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.Scope

class PythonBridgeTest extends SpecWithJUnit with MustMatchers {

  class ctx extends Scope {
    val bridge = new PythonBridge("query-id")
  }

  "transform java list to scala list in nullToEmpty" in new ctx {
    val javaList: util.ArrayList[Any] = Lists.newArrayList("abc", null, "def")
    val scalaList: List[Any] = List("abc", null, "def")

    bridge.nullToEmpty(javaList) must_=== scalaList
  }

  "handle null lists in nullToEmpty" in new ctx {
    val javaList: util.ArrayList[Any] = null
    val scalaList: List[Any] = List()

    bridge.nullToEmpty(javaList) must_=== scalaList
  }

  "handle null values in stringify" in new ctx {
    val javaList: util.ArrayList[Any] = Lists.newArrayList("abc", null, "def")
    val scalaList: List[String] = List("abc", "null", "def")

    bridge.stringify(javaList) must_=== scalaList
  }

}
