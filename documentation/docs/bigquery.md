---
id: bigquery
title: Google BigQuery
sidebar_label: BigQuery
---
## Features
Work with Google bigquery tables straight from Quix, execute multiple queries in parallel, explore the db tree, visualize and download the results into csv.

## Setup

### 1. Pick a new name for your athena note and update .env

Add/update following properties to .env file to configure your new note    

| Variables        | Meaning           | Example  |
| ------------- |:-------------:| -----:|
| `MODULES`      | list of registered notes | `foo,boo` |
| `MODULES_FOO_ENGINE`      | note type | `bigquery` |
| `MODULES_FOO_CREDENTIALS_BASE64` | base64 value of your credentials.json      |  `AABB111222` |
| `MODULES_FOO_SYNTAX` | client-side syntax highlighter      |   `ansi_sql` |


Example of possible configuration that will create new bigquery note named foo : 
```properties
MODULES_BQ_ENGINE=bigquery
MODULES_BQ_SYNTAX=ansi_sql
MODULES_BQ_CREDENTIALS_BASE64=AAABBBCCCDDDEEEFFFF
```

## Troubleshooting