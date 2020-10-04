# Terraform AWS for QUIX-environment
This package allows you to easily create your own QUIX on Amazon Web Services with
[Terraform][https://www.terraform.io/downloads.html] project that builds [VPC
with Public and Private Subnets][https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Scenario2.html#VPC_Scenario2_Implementation] from the AWS documentation.

## Getting Started

**Note: Master is the only supported branch. All other branches of this repo should not be considered stable, and is to be used at your own risk.**


# Getting Started

## Pre Reqs

We use Terraform to automate parts of the infrastructure for your CircleCI Server install, so you will need to install this first:

* [Terraform](https://www.terraform.io/downloads.html)

**Note: This script only supports terraform version 0.12 and higher. Please update to the most recent version before fetching from upstream.**


## Installation

### Basic

1. Clone or download this repository

```bash
git clone git@github.com:wix/quix.git
```
2. Run `terraform init` to install Terraform plugins
3. Run `terraform apply`
4. Visit ALB adress supplied at the end of the Terraform output
5. Follow instructions to setup and configure your installation

### Extra

#### Prepare right [Shared Credentials file for Terraform](https://www.terraform.io/docs/providers/aws/index.html#shared-credentials-file)

  > You can use an AWS credentials file to specify your credentials. The default location is $HOME/.aws/credentials on Linux and OS X, or "%USERPROFILE%\.aws\credentials" for Windows
  > users. If we fail to detect credentials inline, or in the environment, Terraform will check this location. You can optionally specify a different location in the configuration by
  > providing the shared_credentials_file attribute, or in the environment with the AWS_SHARED_CREDENTIALS_FILE variable. This method also supports a profile configuration and matching
  > AWS_PROFILE environment variable:

~/.aws/credentials
```
  [default]
  aws_access_key_id=AKEXAMPLEEXAMPLEEXAMPLE
  aws_secret_access_key=EXAMPLE/K7MDENG/bPxRfiCYEXAMPLEKEY
```

~/.aws/config
```
  [default]
  region=us-east-1
  output=json
```  


### We are using [Terraform S3 BackEnd](https://www.terraform.io/docs/backends/types/s3.html)
* bucket = "tf-state-backend-bucket"
* key            = "terraform.tfstate"
* dynamodb_table = "terraform-lock"
* region = "us-east-1"
* key = "example.tfstate"

## 2. Usage
### 2.1 Import
```
terraform init
```
### 2.2 Apply Plan
```
terraform plan -out vpc.plan &&  terraform apply "vpc.plan"
```

### Plan

```
terraform plan -var-file terraform.tfvars
```

`terraform.tfvars` holds variables which should be overriden with valid ones.

### Apply

```
terraform apply -var-file terraform.tfvars
```

### Destroy

```
terraform destroy -var-file terraform.tfvars
```


## Links
* [Terraform](http://terraform.io)
* [Terraform VPC](https://nickcharlton.net/posts/terraform-aws-vpc.html)
* [scenario_two](http://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/VPC_Scenario2.html)
* [AWS documentation](http://aws.amazon.com/documentation/)
* [blog_post](https://nickcharlton.net/posts/terraform-aws-vpc.html)
* [ECS Resources: The amount of memory used by the task.](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ecs-taskdefinition.html#cfn-ecs-taskdefinition-memory)
## Author

Copyright (c) 2019 Valeriy Soloviov <weldpua2008@gmail.com>.
