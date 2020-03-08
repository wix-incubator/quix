---
id: redshift
title: Amazon Redshift
sidebar_label: Redshift
---

## Features
Query Amazon Redshift data warehouse straight from Quix, execute multiple queries in parallel, explore the db tree, visualize and download the results into csv.


## Setup
To setup Amazon Redshift note you have to perform the following steps :

### 1. Obtain link to redshift jdbc driver 
Go to https://docs.aws.amazon.com/redshift/latest/mgmt/configure-jdbc-connection.html#download-jdbc-driver and choose the jar file that you need.
For example, 
```
https://s3.amazonaws.com/redshift-downloads/drivers/jdbc/1.2.41.1065/RedshiftJDBC42-no-awssdk-1.2.41.1065.jar
``` 

### 2. Update [Dockerfile](https://github.com/wix/quix/blob/master/quix-backend/Dockerfile) 
You need to update the Dockerfile that prepares image of quix-backend to include the missing jar. 
Edit it and add a line that will download the driver and another line to push it into `quix.jar` file 

```
RUN wget -q -P BOOT-INF/lib/ \
    https://s3.amazonaws.com/redshift-downloads/drivers/jdbc/1.2.41.1065/https://s3.amazonaws.com/redshift-downloads/drivers/jdbc/1.2.41.1065/RedshiftJDBC42-no-awssdk-1.2.41.1065.jar

RUN jar uf0 quix.jar \
    BOOT-INF/lib/RedshiftJDBC42-no-awssdk-1.2.41.1065.jar
```
### 3. Build the quix-backend image

Execute the following command to prepare a new docker image of quix-backend 
```
docker-compose build backend
``` 


### 4. Pick new name and update .env

Add/update following properties to .env file to configure your new Amazon Redshift note    

| Variables        | Meaning           | Example  |
| ------------- |:-------------:| -----:|
| `MODULES`      | list of registered notes | `foo,boo,prod,qa` |
| `MODULES_FOO_ENGINE`      | note type | `jdbc` |
| `MODULES_FOO_DRIVER` | jdbc driver class      |   `com.amazon.redshift.jdbc.Driver` |
| `MODULES_FOO_URL` | jdbc url      |   `jdbc:redshift://examplecluster.abc123xyz789.us-west-2.redshift.amazonaws.com:5439/dev` |
| `MODULES_FOO_SYNTAX` | syntax marker      |   `ansi_sql` |


example of redshift jdbc note that will be named `foo` in the UI

```properties
MODULES=<comma separated list of your modules>,foo

MODULES_FOO_ENGINE=jdbc
MODULES_FOO_DRIVER=com.amazon.redshift.jdbc.Driver
MODULES_FOO_URL=jdbc:redshift://examplecluster.abc123xyz789.us-west-2.redshift.amazonaws.com:5439/dev
MODULES_FOO_SYNTAX=ansi_sql
```

## Troubleshooting