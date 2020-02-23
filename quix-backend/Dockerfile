FROM maven:slim as maven

ARG SBT_VERSION=1.3.8

# Install sbt
RUN \
  curl -L -o sbt-$SBT_VERSION.deb https://dl.bintray.com/sbt/debian/sbt-$SBT_VERSION.deb && \
  dpkg -i sbt-$SBT_VERSION.deb && \
  rm sbt-$SBT_VERSION.deb && \
  apt-get update && \
  apt-get install sbt && \
  sbt sbtVersion

COPY quix-api/src ./quix-api/src
COPY quix-core/src ./quix-core/src
COPY /quix-modules/quix-presto-module/src ./quix-modules/quix-presto-module/src
COPY /quix-modules/quix-athena-module/src ./quix-modules/quix-athena-module/src
COPY /quix-modules/quix-bigquery-module/src ./quix-modules/quix-bigquery-module/src
COPY /quix-modules/quix-jdbc-module/src ./quix-modules/quix-jdbc-module/src
COPY /quix-modules/quix-python-module/src ./quix-modules/quix-python-module/src
COPY /quix-modules/quix-dummy-module/src ./quix-modules/quix-dummy-module/src
COPY /quix-webapps/quix-web-spring/src ./quix-webapps/quix-web-spring/src
COPY /quix-webapps/quix-web-spring/pom.xml ./quix-webapps/quix-web-spring/pom.xml

COPY build.sbt .
COPY version.sbt .
RUN sbt +publishM2

WORKDIR /quix-webapps/quix-web-spring
RUN mvn install -DskipTests

FROM ubuntu:19.10

# Setup python and java and base system
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND noninteractive
ENV LANG=en_US.UTF-8

RUN apt-get update && \
  apt-get install -q -y --no-install-recommends \
  default-jdk \
  python3 \
  python-dev \
  python3-dev \
  python3-pip \
  libsnappy-dev \
  language-pack-en \
  build-essential \
  && rm -rf /var/lib/apt/lists/*

RUN pip3 install --no-cache --upgrade pip setuptools wheel py4j

EXPOSE 8081

WORKDIR /quix-webapps/quix-web-spring

COPY --from=maven /quix-webapps/quix-web-spring/target/quix-web-spring-*.jar ./quix.jar

CMD ["java", "-jar", "quix.jar"]
