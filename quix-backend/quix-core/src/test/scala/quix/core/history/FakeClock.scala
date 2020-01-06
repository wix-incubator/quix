package quix.core.history

import java.time.{Clock, Instant, ZoneId, ZoneOffset}
import java.util.concurrent.atomic.AtomicReference

import scala.concurrent.duration.FiniteDuration

case class FakeClock(now: AtomicReference[Instant],
                     getZone: ZoneId) extends Clock {

  override def withZone(zone: ZoneId): Clock = copy(getZone = zone)

  override def instant: Instant = now.get

  def sleep(duration: FiniteDuration): Unit =
    now.updateAndGet(_.plusMillis(duration.toMillis))

}

object FakeClock {
  def apply(now: Instant, zone: ZoneId = ZoneOffset.UTC): FakeClock =
    FakeClock(new AtomicReference(now), zone)
}
