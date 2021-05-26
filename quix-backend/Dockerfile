FROM maven:slim as maven

ARG SBT_VERSION=1.4.1

# Install sbt
RUN \
  curl -L -o sbt-$SBT_VERSION.deb https://dl.bintray.com/sbt/debian/sbt-$SBT_VERSION.deb && \
  dpkg -i sbt-$SBT_VERSION.deb && \
  rm sbt-$SBT_VERSION.deb && \
  apt-get update && \
  apt-get install sbt && \
  sbt sbtVersion -Dsbt.rootdir=true;

COPY build.sbt .
COPY version.sbt .
COPY project/plugins.sbt project
RUN sbt update -Dsbt.rootdir=true;
COPY /quix-webapps/quix-web-spring/pom.xml ./quix-webapps/quix-web-spring/pom.xml
RUN mvn -B -f /quix-webapps/quix-web-spring/pom.xml dependency:resolve --fail-never

COPY quix-api/src ./quix-api/src
COPY quix-core/src ./quix-core/src
COPY /quix-modules/quix-presto-module/src ./quix-modules/quix-presto-module/src
COPY /quix-modules/quix-athena-module/src ./quix-modules/quix-athena-module/src
COPY /quix-modules/quix-bigquery-module/src ./quix-modules/quix-bigquery-module/src
COPY /quix-modules/quix-jdbc-module/src ./quix-modules/quix-jdbc-module/src
COPY /quix-modules/quix-python-module/src ./quix-modules/quix-python-module/src
COPY /quix-modules/quix-dummy-module/src ./quix-modules/quix-dummy-module/src
COPY /quix-webapps/quix-web-spring/src ./quix-webapps/quix-web-spring/src

RUN sbt quixWebSpring/assembly -Dsbt.rootdir=true;
RUN sbt +publishM2 -Dsbt.rootdir=true;
RUN mvn -f /quix-webapps/quix-web-spring/pom.xml install -DskipTests

FROM ubuntu:20.04

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
  wget \
  && rm -rf /var/lib/apt/lists/*

RUN pip3 install --no-cache --upgrade pip setuptools wheel py4j

EXPOSE 8081

WORKDIR /quix-webapps/quix-web-spring

COPY --from=maven /quix-webapps/quix-web-spring/target/quix-web-spring-*.jar ./quix.jar

RUN wget -q -P BOOT-INF/lib/ \
    https://repo1.maven.org/maven2/ru/yandex/clickhouse/clickhouse-jdbc/0.2.4/clickhouse-jdbc-0.2.4.jar \
    https://repo1.maven.org/maven2/org/postgresql/postgresql/42.2.10/postgresql-42.2.10.jar \
    https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.19/mysql-connector-java-8.0.19.jar \
    https://repo1.maven.org/maven2/org/xerial/sqlite-jdbc/3.30.1/sqlite-jdbc-3.30.1.jar \
    https://repo1.maven.org/maven2/org/mariadb/jdbc/mariadb-java-client/2.5.4/mariadb-java-client-2.5.4.jar \
    https://repo1.maven.org/maven2/org/hsqldb/hsqldb/2.5.0/hsqldb-2.5.0.jar \
    https://maven.ceon.pl/artifactory/repo/com/oracle/ojdbc/ojdbc10/19.3.0.0/ojdbc10-19.3.0.0.jar \
    https://repo1.maven.org/maven2/com/microsoft/sqlserver/mssql-jdbc/8.2.1.jre11/mssql-jdbc-8.2.1.jre11.jar

RUN jar uf0 quix.jar \
    BOOT-INF/lib/clickhouse-jdbc-0.2.4.jar \
    BOOT-INF/lib/postgresql-42.2.10.jar \
    BOOT-INF/lib/mysql-connector-java-8.0.19.jar \
    BOOT-INF/lib/sqlite-jdbc-3.30.1.jar \
    BOOT-INF/lib/mariadb-java-client-2.5.4.jar \
    BOOT-INF/lib/hsqldb-2.5.0.jar \
    BOOT-INF/lib/ojdbc10-19.3.0.0.jar \
    BOOT-INF/lib/mssql-jdbc-8.2.1.jre11.jar

CMD ["java", "-jar", "quix.jar"]
