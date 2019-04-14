package quix.core.utils

import java.util.concurrent.{Executors, ScheduledExecutorService, ThreadFactory}

import com.typesafe.scalalogging.LazyLogging

import scala.concurrent.duration.TimeUnit
import scala.util.control.NonFatal

trait Chores extends LazyLogging {
  private val className = this.getClass.toString
  private val poolName = "chore-" + className
  private val executor = scheduledSingleThreadPoolNamed(poolName)

  def chore(): Unit

  def scheduleChore(initialDelay: Long, delay: Long, unit: TimeUnit) = {
    val runnable = new Runnable {
      override def run(): Unit = try {
        logger.info("event=chore-start class-name=" + className)
        chore()
        logger.info("event=chore-finish class-name=" + className)
      } catch {
        case NonFatal(t) =>
          logger.warn("event=chore-failure class-name=" + className, t)
      }
    }

    logger.warn(s"schedule $className.chore() at fixed rate every ${unit.toMinutes(delay)} minutes")
    executor.scheduleAtFixedRate(runnable, initialDelay, delay, unit)
  }

  // helpers
  private def daemonThreadsNamed(format: String): ThreadFactory = {
    r: Runnable => {
      val t = Executors.defaultThreadFactory.newThread(r)
      t.setDaemon(true)
      t.setName(format)
      t
    }
  }

  private def scheduledSingleThreadPoolNamed(format: String): ScheduledExecutorService = {
    Executors.newSingleThreadScheduledExecutor(daemonThreadsNamed(format))
  }
}
