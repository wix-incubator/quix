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
[Redshift](redshift.md), 
Firebird, 
H2, 
HSQLDB, 
Apache Derby, 
IBM DB2, 
Teradata and more. 

You will be able to execute multiple queries in parallel, explore the db tree, visualize and download the results into csv.

## Setup
To setup jdbc note you have to perform the following two steps :

### 1. Add new jdbc dependency to [Dockerfile](https://github.com/wix/quix/blob/master/quix-backend/Dockerfile)
Right now quix is pre-bundled with several populat jdbc drivers. If your driver is missing from the list, 
you should edit the [Dockerfile](https://github.com/wix/quix/blob/master/quix-backend/Dockerfile) and 
add a line that will download the driver and another line to push it into `quix.jar` file 


Examples of pre-bundled jdbc drivers : 
```
RUN wget -q -P BOOT-INF/lib/ \
    https://repo1.maven.org/maven2/ru/yandex/clickhouse/clickhouse-jdbc/0.2.4/clickhouse-jdbc-0.2.4.jar \
    https://repo1.maven.org/maven2/org/postgresql/postgresql/42.2.10/postgresql-42.2.10.jar \
    https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.19/mysql-connector-java-8.0.19.jar \
    https://repo1.maven.org/maven2/org/xerial/sqlite-jdbc/3.30.1/sqlite-jdbc-3.30.1.jar \
    https://repo1.maven.org/maven2/org/mariadb/jdbc/mariadb-java-client/2.5.4/mariadb-java-client-2.5.4.jar \
    https://repo1.maven.org/maven2/org/hsqldb/hsqldb/2.5.0/hsqldb-2.5.0.jar \
    https://maven.ceon.pl/artifactory/repo/com/oracle/ojdbc/ojdbc10/19.3.0.0/ojdbc10-19.3.0.0.jar \
    https://repo1.maven.org/maven2/com/microsoft/sqlserver/mssql-jdbc/8.2.1.jre11/mssql-jdbc-8.2.1.jre11.jar

RUN jar uf0 quix.jar \
    BOOT-INF/lib/clickhouse-jdbc-0.2.4.jar \
    BOOT-INF/lib/postgresql-42.2.10.jar \
    BOOT-INF/lib/mysql-connector-java-8.0.19.jar \
    BOOT-INF/lib/sqlite-jdbc-3.30.1.jar \
    BOOT-INF/lib/mariadb-java-client-2.5.4.jar \
    BOOT-INF/lib/hsqldb-2.5.0.jar \
    BOOT-INF/lib/ojdbc10-19.3.0.0.jar \
    BOOT-INF/lib/mssql-jdbc-8.2.1.jre11.jar
``` 

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