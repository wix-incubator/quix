package quix.python

case class PythonConfig(indexUrl: String = "https://pypi.org/simple", extraIndexUrl: String = "", packages : Seq[String] = Nil)
