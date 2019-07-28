FROM maven:3.6.0

COPY ./ ./
RUN apt-get update && apt-get install libaio1
RUN mvn -T 8 clean install
EXPOSE 8081

WORKDIR /quix-webapps/quix-web-spring
ENTRYPOINT ["mvn", "spring-boot:run"]
