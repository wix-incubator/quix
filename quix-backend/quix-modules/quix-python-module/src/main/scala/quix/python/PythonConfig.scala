package quix.python


/** Python configuration populated via .env or applications.properties of spring
 *
 * @param indexUrl       will be used by pip to search for packages, use your hosted repository for internal packages
 * @param extraIndexUrl  will be used by pip as fallback for indexUrl
 * @param packages       list of packages that should be installed for every user
 * @param userScriptsDir directory that will be used to store user's scripts and virtualenv environments
 * @param additionalCode any additional code that will be prepended to every python script
 */
case class PythonConfig(indexUrl: String = "https://pypi.org/simple",
                        extraIndexUrl: String = "",
                        packages: Seq[String] = Nil,
                        userScriptsDir: String = "/tmp/quix-python",
                        additionalCode: String = "")
