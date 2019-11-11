---
id: athena
title: Amazon Athena
sidebar_label: Athena
---
## Features
Work with Amazon Athena tables straight from Quix, execute multiple queries in parallel, explore the db tree, visualize and download the results into csv.

## Setup

### 1. Create a new IAM Policy

Create a new IAM policy to allow access to your bucket
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetBucketLocation",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name"
            ]
        }
    ]
}
```

### 2. Create a new IAM user
Create a new user with `Programmatic Access`. Attach security policy `AmazonAthenaFullAccess` along with policy created in step 1. 


### 3. Pick a new name for your athena note and update .env

Add/update following properties to .env file to configure your new note    

| Variables        | Meaning           | Example  |
| ------------- |:-------------:| -----:|
| `MODULES`      | list of registered notes | `foo,boo` |
| `MODULES_FOO_ENGINE`      | note type | `athena` |
| `MODULES_FOO_OUTPUT` | s3 bucket for results      |   `s3://some-bucket-id/` |
| `MODULES_FOO_REGION` | aws region      |   `us-east-1` |
| `MODULES_FOO_DATABASE` | default database      |   `default` |
| `MODULES_FOO_AWS_ACCESS_KEY_ID` | aws access key      |    |
| `MODULES_FOO_AWS_SECRET_KEY` | awe secret key      |   |

Example of possible configuration that will create note type named foo : 
```properties
MODULES_FOO_ENGINE=athena
MODULES_FOO_OUTPUT=s3://some-bucket-id/
MODULES_FOO_REGION=us-east-1
MODULES_FOO_DATABASE=default
MODULES_FOO_AWS_ACCESS_KEY_ID=123
MODULES_FOO_AWS_SECRET_KEY=abc
```

## Troubleshooting