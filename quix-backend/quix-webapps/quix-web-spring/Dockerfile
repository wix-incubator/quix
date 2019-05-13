FROM openjdk:8-jdk-alpine

VOLUME /tmp

ARG JAR_FILE=target/quix-web-spring-2.1.0.RELEASE.jar

COPY ${JAR_FILE} app.jar

EXPOSE 8081

ENTRYPOINT ["java","-jar","/app.jar"]