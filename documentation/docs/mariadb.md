---
id: mariadb
title: MariaDB
sidebar_label: MariaDB
---

## Features
Work with MariaDB tables straight from Quix, execute multiple queries in parallel, explore the db tree, visualize and download the results into csv.

## Setup
To setup MariaDB note you have to perform the following two steps :

### 1. Add new jdbc dependency
Find the needed version of postgress jdbc driver on https://mariadb.com/kb/en/library/installing-mariadb-connectorj/#installing-mariadb-connectorj-with-maven or https://mvnrepository.com/artifact/org.mariadb.jdbc/mariadb-java-client and copy the dependency definition to `https://github.com/wix/quix/blob/master/quix-backend/quix-webapps/quix-web-spring/pom.xml`.

For example this is the dependency of 2.5.1 from Oct 2019 that supports Java8 / Java11 and JDBC 4.2: 
```xml
<!-- https://mvnrepository.com/artifact/org.mariadb.jdbc/mariadb-java-client -->
<dependency>
    <groupId>org.mariadb.jdbc</groupId>
    <artifactId>mariadb-java-client</artifactId>
    <version>2.5.1</version>
</dependency>

```

If you are using docker to run quix, run `docker-compose build` to prepare a new image

If you are deploying standalone jar, run `mvn clean install` to prepare new jar.

### 2. Pick new name and update .env

Add/update following properties to .env file to configure your new note    

| Variables        | Meaning           | Example  |
| ------------- |:-------------:| -----:|
| `MODULES`      | list of registered notes | `foo,boo,prod,qa` |
| `MODULES_FOO_ENGINE`      | note type | `jdbc` |
| `MODULES_FOO_DRIVER` | jdbc driver class      |   `org.mariadb.jdbc.Driver` |
| `MODULES_FOO_URL` | jdbc url      |   `jdbc:mariadb://localhost:3306/DB` |
| `MODULES_FOO_USER` | db username      |   `user` |
| `MODULES_FOO_PASS` | db password      |   `pass` |
| `MODULES_FOO_SYNTAX` | syntax marker      |   `mysql`|


example of mariadb jdbc note that will be named `foo` in the UI

```properties
MODULES=<comma separated list of your modules>,foo

MODULES_FOO_ENGINE=jdbc
MODULES_FOO_DRIVER=org.mariadb.jdbc.Driver
MODULES_FOO_URL=jdbc:mariadb://localhost:3306/DB
MODULES_FOO_USER=your-username
MODULES_FOO_PASS=your-password
MODULES_FOO_SYNTAX=mysql
```

## Troubleshooting