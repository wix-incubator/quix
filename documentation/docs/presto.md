---
id: presto
title: Presto
sidebar_label: Presto
---
## Features
Quix is a great tool for querying Presto. You can execute multiple queries in parallel, 
stream results straight to your browser, download them as csv, build visualizations, 
share your notes with other people in your organization and more.

## Setup

### 1. Pick a new name for your presto note and update .env

Add the following properties to the .env file to configure your new presto note

| Variables        | Meaning           | Example  |
| ------------- |:-------------:| -----:|
| `MODULES`      | list of registered notes | `foo,boo` |
| `MODULES_FOO_ENGINE`      | note type | `presto` |
| `MODULES_FOO_API` | presto url      |   `http://presto.your-domain.com:8080/v1` |
| `MODULES_FOO_CATALOG` | default catalog      |   `system` |
| `MODULES_FOO_SCHEMA` | default schema      |   `runtime` |
| `MODULES_FOO_SOURCE` | default source      |   `quix` |

Example of possible configuration that will create Presto note named foo : 
```properties
MODULES_FOO_ENGINE=presto
MODULES_FOO_API=http://presto:8080/v1
MODULES_FOO_CATALOG=system
MODULES_FOO_SCHEMA=runtime
MODULES_FOO_SOURCE=quix
```

## Troubleshooting
