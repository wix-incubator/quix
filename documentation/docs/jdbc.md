---
id: jdbc
title: Jdbc
sidebar_label: Jdbc
---

## Features
Using jdbc note you can use quix to query 
[MySQL](mysql.md), 
[ClickHouse](clickhouse.md), 
[PostgreSQL](postgresql.md), 
Microsoft SQL Server, 
[MariaDB](mariadb.md), 
[Oracle](oracle.md), 
SQLite, 
Redshift, 
Firebird, 
H2, 
HSQLDB, 
Apache Derby, 
IBM DB2, 
Teradata and more. 

You will be able to execute multiple queries in parallel, explore the db tree, visualize and download the results into csv.

## Setup
To setup jdbc note you have to perform the following two steps :

### 1. Add new jdbc dependency
If your database supports jdbc, find the correct maven dependency and  add it to `https://github.com/wix/quix/blob/master/quix-backend/quix-webapps/quix-web-spring/pom.xml`.

If you are using docker to run quix, run `docker-compose build` to prepare a new image

If you are deploying standalone jar, run `mvn clean install` to prepare new jar. 

### 2. Pick new name and update .env

Add/update following properties to .env file to configure your new note    

| Variables        | Meaning           | Example  |
| ------------- |:-------------:| -----:|
| `MODULES`      | list of registered notes | `foo,boo,prod,qa` |
| `MODULES_FOO_ENGINE`      | note type | `jdbc` |
| `MODULES_FOO_DRIVER` | jdbc driver class      |   `org.postgresql.Driver` |
| `MODULES_FOO_URL` | jdbc url      |   `jdbc:postgresql:postgres` |
| `MODULES_FOO_USER` | db username      |   `user` |
| `MODULES_FOO_PASS` | db password      |   `pass` |
| `MODULES_FOO_SYNTAX` | syntax marker      |   `mysql` or `ansi_sql` |


example of postgres jdbc note that will be named `foo` in the UI

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