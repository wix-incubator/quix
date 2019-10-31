---
id: athena
title: Amazon Athena
sidebar_label: Athena
---
## Features
Work with Amazon Athena tables straight from Quix, execute multiple queries in parallel, explore the db tree, visualize and download the results into csv.

## Setup

### 1. Pick a new name for your athena note and update .env

Add/update following properties to .env file to configure your new note    

| Variables        | Meaning           | Example  |
| ------------- |:-------------:| -----:|
| `MODULES`      | list of registered notes | `foo,boo` |
| `MODULES_FOO_ENGINE`      | note type | `athena` |
| `MODULES_FOO_OUTPUT` | s3 bucket for results      |   `s3://some-bucket-id/` |
| `MODULES_FOO_REGION` | aws region      |   `us-east-1` |
| `MODULES_FOO_DATABASE` | default database      |   `default` |

Example of possible configuration that will create note type named foo : 
```properties
MODULES_FOO_ENGINE=athena
MODULES_FOO_OUTPUT=s3://some-bucket-id/
MODULES_FOO_REGION=us-east-1
MODULES_FOO_DATABASE=default
```

## Troubleshooting