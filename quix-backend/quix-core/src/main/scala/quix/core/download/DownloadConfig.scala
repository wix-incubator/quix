package quix.core.download

import java.io.InputStream
import java.nio.file.{Files, Path, Paths}
import java.util.zip.GZIPInputStream

import com.amazonaws.auth.{AWSStaticCredentialsProvider, BasicAWSCredentials}
import com.amazonaws.services.s3.{AmazonS3, AmazonS3ClientBuilder}
import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task

case class DownloadConfig(downloadDir: String, cloudConfig: Map[String, String] = Map.empty)

trait QueryResultsStorage {
  def upload(queryId: String, file: Path): Task[Unit]

  def exists(queryId: String): Task[Boolean]

  def delete(queryId: String): Task[Unit]

  def getInputStream(queryId: String): Task[InputStream]
}

object QueryResultsStorage {
  def apply(config: DownloadConfig): QueryResultsStorage = {
    config.cloudConfig match {
      case _ if hasS3Keys(config.cloudConfig) =>
        initS3(config.cloudConfig)
      case _ =>
        initLocalFS(config)
    }
  }

  def hasS3Keys(config: Map[String, String]) = {
    config.keySet.contains("accessKey") &&
      config.keySet.contains("secretKey") &&
      config.keySet.contains("region") &&
      config.keySet.contains("bucket")
  }

  def initS3(config: Map[String, String]): QueryResultsStorage = {
    val accessKey = config("accessKey")
    val secretKey = config("secretKey")
    val region = config("region")
    val bucket = config("bucket")

    val credentials = new AWSStaticCredentialsProvider(new BasicAWSCredentials(accessKey, secretKey))

    val amazonS3Client: AmazonS3 = AmazonS3ClientBuilder
      .standard()
      .withCredentials(credentials)
      .withRegion(region)
      .build()

    new QueryResultsStorage with LazyLogging {
      override def upload(queryId: String, file: Path): Task[Unit] = Task {
        logger.info(s"event=s3-upload-start query-id=$queryId file=$file size=${Files.size(file)}")
        amazonS3Client.putObject(bucket, queryId, file.toFile)
        logger.info(s"event=s3-upload-done query-id=$queryId file=$file size=${Files.size(file)}")
      }

      override def getInputStream(queryId: String): Task[InputStream] = Task {
        logger.info(s"event=s3-get-inputstream-start query-id=$queryId")
        val is = new GZIPInputStream(amazonS3Client.getObject(bucket, queryId).getObjectContent)
        logger.info(s"event=s3-get-inputstream-done query-id=$queryId")
        is
      }

      override def exists(queryId: String): Task[Boolean] = Task {
        logger.info(s"event=s3-exists-start query-id=$queryId")
        val response = amazonS3Client.doesObjectExist(bucket, queryId)
        logger.info(s"event=s3-exists-done query-id=$queryId response=$response")
        response
      }

      override def delete(queryId: String): Task[Unit] = Task {
        logger.info(s"event=s3-delete-start query-id=$queryId")
        amazonS3Client.deleteObject(bucket, queryId)
        logger.info(s"event=s3-delete-done query-id=$queryId")
      }
    }
  }

  def initLocalFS(config: DownloadConfig): QueryResultsStorage = {
    new QueryResultsStorage {
      override def upload(queryId: String, file: Path): Task[Unit] = Task.unit

      override def getInputStream(queryId: String): Task[InputStream] = Task {
        val path = Paths.get(config.downloadDir, queryId)
        new GZIPInputStream(Files.newInputStream(path))
      }

      override def exists(queryId: String): Task[Boolean] = Task(Files.exists(Paths.get(config.downloadDir, queryId)))

      override def delete(queryId: String): Task[Unit] = Task(Files.deleteIfExists(Paths.get(config.downloadDir, queryId)))
    }
  }
}