# Quix Backend
Quix backend is based on SpringBoot and Scala, and is built with Maven.
 
## Installation

### Requirements
* Presto
* Docker
* Maven 3.6

### Building
The default build will download all dependencies inside the Docker container. This build is safer and doesn't require Maven to be installed locally, but takes longer.
``` 
docker build -t quix-backend .
```

#### Fat JAR
You can also build fat JAR with maven and dockerize it:
```
mvn -T 8 clean install && docker build -f ./Dockerfile.fat -t quix-backend .
```

This option requires Maven to be installed locally, but is faster, since it utilizes Maven cache.

### Running
Provide a mandatory config values to docker
```
docker run -p 8080:8080 --name quix-backend -t quix-backend 
```

In case you have local `application.properties` file, we can map it into Docker container and execute it
```docker run -v /path-to-local/application.properties:/application.properties -p 8080:8080 -t quix-backend``` 

## Sample application.properties 
```
server.port=8080

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
