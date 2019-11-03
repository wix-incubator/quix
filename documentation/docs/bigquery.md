---
id: bigquery
title: Google BigQuery
sidebar_label: BigQuery
---
## Features
Work with Google bigquery tables straight from Quix, execute multiple queries in parallel, explore the db tree, visualize and download the results into csv.

## Setup

### 1. Create a new service account
Go to `Api & Services` -> `Credentials` and click `Create credentials` with `Service Account key`.
Choose new service account in the dropdown, enter quix-bigquery-user as username, 
`BigQuery Admin` as role, and `Json` as key type.

Store resulting json in a secure location and use `base64` command line tool to calculate the base64 string of the file contents.
Alternatively use some online tool like https://www.base64encode.org/ to process the contents of json with credentials.     

### 2. Pick a new name for your bigquery note and update .env

Add/update following properties in .env file to configure your new note    

| Variables        | Meaning           | Example  |
| ------------- |:-------------:| -----:|
| `MODULES`      | list of registered notes | `foo,boo` |
| `MODULES_FOO_ENGINE`      | note type | `bigquery` |
| `MODULES_FOO_CREDENTIALS_BASE64` | base64 value of your credentials.json      |  `AABB111222` |


Example of possible configuration that will create new bigquery note named foo : 
```properties
MODULES_BQ_ENGINE=bigquery
MODULES_BQ_SYNTAX=ansi_sql
MODULES_BQ_CREDENTIALS_BASE64=AAABBBCCCDDDEEEFFFF
```

## Troubleshooting