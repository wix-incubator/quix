# Quix Frontend
Quix frontend serves the UI.


## Requirements
* NodeJS
* MySQL 5.7

## Setup
You can set up your DB either by providing environment variables or by directly changing default settings.

### Environment variables
Application uses the following environment variables to connect to DB:
* DB_NAME - defaults to `quix`
* DB_USER - defaults to `root`
* DB_PASS - defaults to empty password
* DB_HOST - defaults to `localhost`
* DB_PORT - defaults to `3306`

### Default settings
Default settings for DB can be found under [service/src/config/env.ts](./service/src/config/env.ts)

### MySQL 8 considerations
If you're using MySQL 8, you may need to run the following command on your DB:
``` 
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
```

## Docker

### Starting
```
docker build -t quix-frontend . && docker run --name quix-frontend -p 3000:3000 -t quix-frontend
```

### Stopping 
```
docker stop quix-frontend && docker rm quix-frontend
```

### License
MIT
