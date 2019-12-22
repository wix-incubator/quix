# Terraform AWS for QUIX-environment

## 1.Prepare right [Shared Credentials file for Terraform](https://www.terraform.io/docs/providers/aws/index.html#shared-credentials-file)

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

This repository contains a [Terraform][] project that builds [Scenario 2: VPC
with Public and Private Subnets][scenario_two] from the [AWS documentation][].
It's from [this blog post][blog_post] describing how it all works and is
designed to give a working example which can the basis of something much more
complex.

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

## Author

Copyright (c) 2019 Valeriy Soloviov <weldpua2008@gmail.com>.
