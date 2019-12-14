FROM maven:3.6.0-alpine as maven

COPY pom.xml ./
COPY quix-api/pom.xml ./quix-api/
COPY quix-core/pom.xml ./quix-core/
COPY /quix-modules/quix-presto-module/pom.xml ./quix-modules/quix-presto-module/
COPY /quix-modules/quix-athena-module/pom.xml ./quix-modules/quix-athena-module/
COPY /quix-modules/quix-bigquery-module/pom.xml ./quix-modules/quix-bigquery-module/
COPY /quix-modules/quix-jdbc-module/pom.xml ./quix-modules/quix-jdbc-module/
COPY /quix-modules/quix-python-module/pom.xml ./quix-modules/quix-python-module/
COPY /quix-webapps/quix-web-spring/pom.xml ./quix-webapps/quix-web-spring/

RUN mvn -B -e -C -T 1C org.apache.maven.plugins:maven-dependency-plugin:3.1.1:go-offline --fail-never

COPY quix-api/src ./quix-api/src
RUN mvn -T 1C install -pl quix-api -am -DskipTests

COPY quix-core/src ./quix-core/src
RUN mvn -T 1C install -pl quix-core -am -DskipTests

COPY /quix-modules/quix-presto-module/src ./quix-modules/quix-presto-module/src
RUN mvn -T 1C install -pl quix-modules/quix-presto-module -am -DskipTests

COPY /quix-modules/quix-athena-module/src ./quix-modules/quix-athena-module/src
RUN mvn -T 1C install -pl quix-modules/quix-athena-module -am -DskipTests

COPY /quix-modules/quix-bigquery-module/src ./quix-modules/quix-bigquery-module/src
RUN mvn -T 1C install -pl quix-modules/quix-bigquery-module -am -DskipTests

COPY /quix-modules/quix-jdbc-module/src ./quix-modules/quix-jdbc-module/src
RUN mvn -T 1C install -pl quix-modules/quix-jdbc-module -am -DskipTests

COPY /quix-modules/quix-python-module/src ./quix-modules/quix-python-module/src
RUN mvn -T 1C install -pl quix-modules/quix-python-module -am -DskipTests

COPY /quix-webapps/quix-web-spring/src ./quix-webapps/quix-web-spring/src
RUN mvn -T 1C install -pl quix-webapps/quix-web-spring -am -DskipTests

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

COPY --from=maven /quix-webapps/quix-web-spring/target/*.jar ./

CMD ["java", "-jar", "quix-web-spring-1.0.0.jar"]
