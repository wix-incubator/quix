package quix.core.utils

import java.lang.reflect.{ParameterizedType, Type}
import java.util.TimeZone

import com.fasterxml.jackson.core.`type`.TypeReference
import com.fasterxml.jackson.databind.SerializationFeature._
import com.fasterxml.jackson.databind.{DeserializationFeature, JsonNode, ObjectMapper}
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import quix.core.utils.JacksonSupport._

import scala.util.control.NonFatal

trait StringJsonHelpersSupport {

  implicit class String2jsonNode(s: String) {
    def asJson(implicit mapper: ObjectMapper): JsonNode = mapper.readTree(s)

    def as[T](implicit mn: Manifest[T], mapper: ObjectMapper): T = deserialize[T](s)

    def get(key: String, default: String = "")(implicit mapper: ObjectMapper) = {
      try {
        s.asJson.get(key) match {
          case null => default
          case node if node.isTextual => node.asText(default)
          case node if node.isObject && node.toString.nonEmpty => node.toString
          case _ => default
        }
      } catch {
        case NonFatal(_) => default
      }
    }
  }

  implicit class AnyObject2JsonNode(o: Any) {
    def asJsonStr(implicit mapper: ObjectMapper): String = mapper.writeValueAsString(o)
  }

}

object JacksonSupport {
  def deserialize[T](value: String)(implicit mn: Manifest[T], mapper: ObjectMapper): T =
    mapper.readValue(value, typeReference[T])

  private def typeReference[T: Manifest] = new TypeReference[T] {
    override def getType = typeFromManifest(manifest[T])
  }

  private def typeFromManifest(m: Manifest[_]): Type = {
    if (m.typeArguments.isEmpty) {
      m.runtimeClass
    }
    else new ParameterizedType {
      def getRawType = m.runtimeClass

      def getActualTypeArguments = m.typeArguments.map(typeFromManifest).toArray

      def getOwnerType = null
    }
  }
}

object JsonOps {

  private val defaultModules = Seq(new DefaultScalaModule, new Jdk8Module)

  def global: ObjectMapper = Implicits.global

  def objectMapperFromTemplate: ObjectMapper =
    new ObjectMapper().registerModules(defaultModules: _*)
      .disable(WRITE_DATES_AS_TIMESTAMPS)
      .setTimeZone(TimeZone.getTimeZone("UTC"))

  object Implicits {
    implicit lazy val global: ObjectMapper = objectMapperFromTemplate
      .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
  }

}