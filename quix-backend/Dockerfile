FROM maven:3.6.0-alpine as maven

COPY pom.xml ./
COPY quix-api/pom.xml ./quix-api/
COPY quix-core/pom.xml ./quix-core/
COPY /quix-modules/quix-presto-module/pom.xml ./quix-modules/quix-presto-module/
COPY /quix-modules/quix-athena-module/pom.xml ./quix-modules/quix-athena-module/
COPY /quix-modules/quix-bigquery-module/pom.xml ./quix-modules/quix-bigquery-module/
COPY /quix-modules/quix-jdbc-module/pom.xml ./quix-modules/quix-jdbc-module/
COPY /quix-webapps/quix-web-spring/pom.xml ./quix-webapps/quix-web-spring/

RUN mvn -T 8 dependency:go-offline -B --fail-never

COPY quix-api/src ./quix-api/src
COPY quix-core/src ./quix-core/src
COPY /quix-modules/quix-presto-module/src ./quix-modules/quix-presto-module/src
COPY /quix-modules/quix-athena-module/src ./quix-modules/quix-athena-module/src
COPY /quix-modules/quix-bigquery-module/src ./quix-modules/quix-bigquery-module/src
COPY /quix-modules/quix-jdbc-module/src ./quix-modules/quix-jdbc-module/src
COPY /quix-webapps/quix-web-spring/src ./quix-webapps/quix-web-spring/src

RUN mvn -T 8 install -pl quix-webapps/quix-web-spring -am -DskipTests

FROM openjdk:8-alpine

EXPOSE 8081

WORKDIR /quix-webapps/quix-web-spring

COPY --from=maven /quix-webapps/quix-web-spring/target/*.jar ./

CMD ["java", "-jar", "quix-web-spring-1.0.0.jar"]
