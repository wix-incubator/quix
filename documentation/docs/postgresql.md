---
id: postgresql
title: PostgreSQL
sidebar_label: PostgreSQL
---

## Features
Work with PostgreSQL straight from Quix, execute multiple queries in parallel, explore the db tree, visualize and download the results into csv.


## Setup
To setup PostgreSQL note you have to perform the following two steps :

### 1. Add new jdbc dependency
Find the needed version of postgresql jdbc driver on https://github.com/pgjdbc/pgjdbc and copy the dependency definition to `https://github.com/wix/quix/blob/master/quix-backend/quix-webapps/quix-web-spring/pom.xml`.

For example this is the dependency of 42.2.7 for java8 : 
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.2.7</version>
</dependency>
```

If you are using docker to run quix, run `docker-compose build` to prepare a new image

If you are deploying standalone jar, run `mvn clean install` to prepare new jar. 


### 2. Pick new name and update .env

Add/update following properties to .env file to configure your new postgresql note    

| Variables        | Meaning           | Example  |
| ------------- |:-------------:| -----:|
| `MODULES`      | list of registered notes | `foo,boo,prod,qa` |
| `MODULES_FOO_ENGINE`      | note type | `jdbc` |
| `MODULES_FOO_DRIVER` | jdbc driver class      |   `org.postgresql.Driver` |
| `MODULES_FOO_URL` | jdbc url      |   `jdbc:postgresql:postgres` |
| `MODULES_FOO_USER` | db username      |   `user` |
| `MODULES_FOO_PASS` | db password      |   `pass` |
| `MODULES_FOO_SYNTAX` | syntax marker      |   `ansi_sql` |


example of postgresql jdbc note that will be named `foo` in the UI

```properties
MODULES=<comma separated list of your modules>,foo

MODULES_FOO_ENGINE=jdbc
MODULES_FOO_DRIVER=org.postgresql.Driver
MODULES_FOO_URL=jdbc:postgresql:postgres
MODULES_FOO_USER=your-user
MODULES_FOO_PASS=your-password
MODULES_FOO_SYNTAX=ansi_sql
```

## Troubleshooting