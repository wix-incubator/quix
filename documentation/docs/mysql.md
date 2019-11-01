---
id: mysql
title: MySQL
sidebar_label: MySQL
---

## Features
Work with MySQL tables straight from Quix, execute multiple queries in parallel, explore the db tree, visualize and download the results into csv.


## Setup
To setup MySQL note you have to perform the following two steps :

### 1. Pick new name and update .env

Add/update following properties to .env file to configure your new note    

| Variables        | Meaning           | Example  |
| ------------- |:-------------:| -----:|
| `MODULES`      | list of registered notes | `foo,boo,prod,qa` |
| `MODULES_FOO_ENGINE`      | note type | `jdbc` |
| `MODULES_FOO_DRIVER` | jdbc driver class      |   `com.mysql.jdbc.Driver` |
| `MODULES_FOO_URL` | jdbc url      |   `jdbc:mysql://localhost/test` |
| `MODULES_FOO_USER` | db username      |   `user` |
| `MODULES_FOO_PASS` | db password      |   `pass` |
| `MODULES_FOO_SYNTAX` | syntax marker      |   `mysql`|


example of mysql jdbc note that will be named `foo` in the UI

```properties
MODULES=<comma separated list of your modules>,foo

MODULES_FOO_ENGINE=jdbc
MODULES_FOO_DRIVER=com.mysql.jdbc.Driver
MODULES_FOO_URL=jdbc:mysql://localhost/test
MODULES_FOO_USER=your-username
MODULES_FOO_PASS=your-password
MODULES_FOO_SYNTAX=mysql
```

## Troubleshooting