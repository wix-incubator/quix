package quix.web.controllers

import org.specs2.mutable.SpecWithJUnit
import quix.api.v1.execute.{Empty, StartCommand}

class ExecutionEventTest extends SpecWithJUnit {

  "ExecutionEvent" should {
    "fallback to Empty on unknown payloads" in {

      "foo" match {
        case ExecutionEvent(_, data) =>
          data must_=== Empty
      }
    }

    "handle ping command" in {
      """{"event" : "ping"}""" match {
        case ExecutionEvent(name, data) =>
          name must_=== "ping"
          data must_=== Empty
      }
    }

    "handle execute command with empty session and text" in {
      """{"event" : "execute", "data" : {"code" : ""}}""" match {
        case ExecutionEvent(name, data) =>
          name must_=== "execute"
          data must_=== StartCommand("", Map.empty)
      }
    }

    "handle execute command with empty session and non empty text" in {
      """{"event" : "execute", "data" : {"code" : "select 1"}}""" match {
        case ExecutionEvent(name, data) =>
          name must_=== "execute"
          data must_=== StartCommand("select 1", Map.empty)
      }
    }

    "handle execute command with session and text" in {
      """{"event" : "execute", "data" : {"code" : "select 1", "session" : {"foo" : "123"}}}""" match {
        case ExecutionEvent(name, data) =>
          name must_=== "execute"
          data must_=== StartCommand("select 1", Map("foo" -> "123"))
      }
    }
  }

}
