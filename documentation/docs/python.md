---
id: python
title: Python
sidebar_label: Python
---
## Features
* Execute lightweight Python scripts straight from Quix
* Manage pip packages on user-level
* Render and visualize results in Quix

## Ideas for using python in Quix
1) Python notes can be used to orchestrate more complex processes that are hard to
achieve in simple sql note, so it's a perfect tool for simple prototyping and ETLS.  

2) You can query much more data sources in addition to out-of-the-box Quix notes.
 For example, PyMongo can be used to query MongoDB, hbase-python for HBase, boto3 for s3, python-firebase for firebase and many more. 

## Setup

### 1. Pick a new name for your python note and update .env

Add the following properties to the .env file to configure your new python note

| Variables        | Meaning           | Example  |
| ------------- |:-------------:| -----:|
| `MODULES`      | list of registered notes | `foo,boo` |
| `MODULES_FOO_ENGINE`      | note type | `python` |
| `MODULES_FOO_SYNTAX`      | note syntax | `python` |
| `MODULES_FOO_PIP_INDEX`      | custom pip index url | `https://your-own-pypi-mirror.org/simple` |
| `MODULES_FOO_PIP_EXTRA_INDEX`      | extra pip index url | `https://pypi.python.org/simple` |
| `MODULES_FOO_PIP_PACKAGES`      | list of mandatory pip packages | `ujson,pyhive` |
| `MODULES_FOO_SCRIPTS_DIR`      | dir that will be used to store each user temp files | `/tmp/quix-python` |
| `MODULES_FOO_ADDITIONAL_CODE_FILE`      | additional code that would be prepended to each python note | `/tmp/quix-python/init.py` |

Example : 
```properties
MODULES=foo
MODULES_FOO_ENGINE=python
MODULES_FOO_SYNTAX=python
MODULES_FOO_PIP_INDEX=https://pypi.your-domain.com/simple
MODULES_FOO_PIP_EXTRA_INDEX=https://pypi.python.org/simple
MODULES_FOO_PIP_PACKAGES=ujson,requests
MODULES_FOO_SCRIPTS_DIR=/tmp/quix-python
MODULES_FOO_ADDITIONAL_CODE_FILE=/tmp/quix-python/init.py
```

## Troubleshooting
