# Quix Backend
Quix backend is based on SpringBoot and Scala, and is built with sbt and Maven.
 
## Installation

### Requirements
* Presto
* Docker
* Maven 3.6
* sbt 1.3.8

### Building
The default build will download all dependencies inside the Docker container. This build is safer and doesn't require sbt/Maven to be installed locally, but takes longer.
``` 
docker build -t quix-backend .
```

### Running
Provide a mandatory config values to docker
```
docker run -p 8081:8081 --name quix-backend -t quix-backend 
```

In case you have local `application.properties` file, we can map it into Docker container and execute it
```docker run -v /path-to-local/application.properties:/application.properties -p 8081:8081 -t quix-backend``` 

## Sample application.properties 
```
server.port=8081

# logging levels of different classes
logging.level.org.springframework.web=DEBUG
logging.level.org.hibernate=ERROR

# mandatory presto api url
presto.api=<your-presto-master-hostname>:8181/v1

# refresh policy of db tree, every 15 minutes with initial 1 minute delay
db.refresh.initialDelayInMinutes=1
db.refresh.delayInMinutes=15

```

### Stopping
``` 
docker stop quix-backend && docker rm quix-backend 
```

## License
MIT

## Contributing
