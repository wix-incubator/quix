package quix.core.download


object CsvUtils {

  def quote(data: Any): String = {
    val string = data match {
      case null => ""
      case "\"" =>
        // double quote should be escaped with another double quote
        // https://stackoverflow.com/questions/17808511/properly-escape-a-double-quote-in-csv
        "\"\""
      case list: List[_] => list.mkString(",")
      case _ => data.toString
    }
    "\"" + string + "\""
  }
}



