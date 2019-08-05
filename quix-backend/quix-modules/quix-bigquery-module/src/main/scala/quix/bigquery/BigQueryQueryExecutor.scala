package quix.bigquery

import java.io.{IOException, StringReader}
import java.net.URI
import java.security.{NoSuchAlgorithmException, PrivateKey}
import java.security.spec.{InvalidKeySpecException, PKCS8EncodedKeySpec}

import com.google.api.client.googleapis.json.GoogleJsonResponseException
import com.google.api.client.util.{PemReader, SecurityUtils}
import com.google.auth.oauth2.ServiceAccountCredentials
import com.google.cloud.bigquery.{BigQueryOptions, TableResult}
import com.google.cloud.http.HttpTransportOptions.DefaultHttpTransportFactory
import com.google.common.collect.Lists
import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.execute._
import quix.core.utils.TaskOps._

import scala.concurrent.duration.{FiniteDuration, _}

class BigQueryQueryExecutor(val client: BigQueryClient,
                            val initialAdvanceDelay: FiniteDuration = 100.millis,
                            val maxAdvanceDelay: FiniteDuration = 15.seconds)
  extends AsyncQueryExecutor[String, Batch] with LazyLogging {

  override def runTask(query: ActiveQuery[String], builder: Builder[String, Batch]): Task[Unit] = {
    //val close = (startExecution: StartQueryExecutionResult) => client.close(startExecution.getQueryExecutionId)
    ???
  }

  def initClient(query: ActiveQuery[String], builder: Builder[String, Batch]): Task[TableResult] = {
    val log = Task(logger.info(s"method=initClient event=start query-id=${query.id} user=${query.user.email} sql=${query.text}"))

    val clientTask = client
      .init(query)
      .logOnError(s"method=initClient event=error query-id=${query.id} user=${query.user.email} sql=${query.text}")
      .onErrorHandleWith {
        case e: Exception =>
          builder.error(query.id, rewriteException(e))
            .flatMap(_ => Task.raiseError(rewriteException(e)))
      }

    log.flatMap(_ => clientTask)
  }

  def rewriteException(e: Exception): Exception = {
    def badCredentials(e: Exception) = {
      new IllegalStateException(
        s"""
           |BigQuery can't be reached, make sure you configured credentials correctly from the JSON file.
           |Refer to https://cloud.google.com/iam/docs/creating-managing-service-account-keys for details.
           |
           |Underlying exception name is ${e.getClass.getSimpleName} with message [${e.getMessage}]
           |
           |""".stripMargin, e)
    }

    e match {
      case e: GoogleJsonResponseException if e.getMessage.contains("401 Unauthorized")=>
        badCredentials(e)
      case _ => e
    }
  }
}

object BigQueryQueryExecutor {
  def apply(config: BigQueryConfig) = {

    def privateKeyFromPkcs8(privateKeyPkcs8: String): PrivateKey = {
      val reader = new StringReader(privateKeyPkcs8)
      val section = PemReader.readFirstSectionAndClose(reader, "PRIVATE KEY")
      if (section == null) throw new IOException("Invalid PKCS#8 data.")
      else {
        val bytes = section.getBase64DecodedBytes
        val keySpec = new PKCS8EncodedKeySpec(bytes)
        try {
          val keyFactory = SecurityUtils.getRsaKeyFactory
          keyFactory.generatePrivate(keySpec)
        } catch {
          case var7@(_: InvalidKeySpecException | _: NoSuchAlgorithmException) =>
            throw new IOException("Unexpected exception reading PKCS#8 data", var7)
        }
      }
    }

    val credentials = ServiceAccountCredentials
      .newBuilder()
      .setClientEmail(config.clientEmail)
      .setClientId(config.clientId)
      .setHttpTransportFactory(new DefaultHttpTransportFactory)
      .setPrivateKey(privateKeyFromPkcs8(config.privateKey.stripMargin))
      .setPrivateKeyId(config.privateKey)
      .setProjectId(config.projectId)
      .setScopes(Lists.newArrayList("https://www.googleapis.com/auth/cloud-platform"))
      .setServiceAccountUser(null)
      .setTokenServerUri(new URI(config.tokenUri))
      .build()

    val bigQuery = BigQueryOptions
      .newBuilder()
      .setCredentials(credentials)
      .build()
      .getService

    val client = new GoogleBigQueryClient(bigQuery, config)
    new BigQueryQueryExecutor(client)
  }
}