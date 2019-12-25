variable "aws_access_key" {
}

variable "aws_secret_key" {
}

variable "aws_key_path" {
}

variable "aws_key_name" {
  default = "valeriys"
}

variable "vpc_name" {
  description = "VPC Name"
  default = "quix"
}

variable "aws_region" {
  description = "EC2 Region for the VPC"
  default     = "us-east-1"
}

variable "aws_availability_zone" {
  default = "us-east-1a"
}

variable "az_count" {
  description = "Number of AZs to cover in a given AWS region"
  default     = "2"
}

variable "fargate_cpu" {
  description = "Fargate instance CPU units to provision (1 vCPU = 1024 CPU units)"
  default     = "256"
}

variable "fargate_memory" {
  description = "Fargate instance memory to provision (in MiB)"
  default     = "512"
}

variable "quix_backend_image" {
  description = "Docker image for backend to run in the ECS cluster"
  default     = "wixquix/quix-backend:release-v1"

}

variable "quix_frontend_image" {
  description = "Docker image for frontend to run in the ECS cluster"
  default     = "wixquix/quix-frontend:release-v1"
}

variable "presto_image" {
  description = "Docker image for Presto to run in the ECS cluster"
  default     = "starburstdata/presto:latest"
}

variable "backend_port" {
  description = "Port exposed by the docker image of backend"
  default     = 8081
}

variable "frontend_port" {
  description = "Port exposed by the docker image of frontend"
  default     = 3000
}

variable "presto_port" {
  description = "Port exposed by the docker image of presto"
  default     = 8080
}
variable "mapPublicIP" {
  default = true
}

variable "tags" {
  default     = {
      ManagedByTerraform = true
      Terraform = true
      Project = "Quix"
      Environment = "production"

  }
  type        = map(string)
  description = "A mapping of tags to assign to all resources."
}


variable "tf_dynamodb_lock_table_enabled" {
  default = 1
  description = "Affects terraform-aws-backend module behavior. Set to false or 0 to prevent this module from creating the DynamoDB table to use for terraform state locking and consistency. More info on locking for aws/s3 backends: https://www.terraform.io/docs/backends/types/s3.html. More information about how terraform handles booleans here: https://www.terraform.io/docs/configuration/variables.html"
}

variable "tf_dynamodb_lock_table_name" {
  default = "terraform-lock"
}

variable "tf_lock_table_read_capacity" {
  default = 1
}

variable "tf_lock_table_write_capacity" {
  default = 1
}

variable "create_separate_presto" {
  description  = "Defines if we need to create Presto ECS & talk to it via ALB"
  default = false
}

# Let's Encrypt Account Registration Config

variable "enable_ssl" {
  description  = "Defines if we need to enable SSL for ALB"
  default = false
}

variable "dns_domain_name"          {
    default = "quix-demo.io"
}

variable "acme_server_url"          {
    default = "https://acme.api.letsencrypt.org/directory"
}
variable "acme_registration_email"  {
    default = "quix-demo@quix-demo.io"
}


variable "aws_acme_profile"                 {
    default = "acme"
}
variable "acme_account_key_pem"                 {  default = "" }
variable "acme_certificate_common_name"         {
    description = "Domain for letsencrypt"
    default = "quix-demo.io"

}
variable "min_days_remaining" {
  description = "The minimum amount of days remaining on the expiration of a certificate before a renewal is attempted"
  default     = 14
}

variable "acme_challenge_aws_access_key_id"     { default = ""}
variable "acme_challenge_aws_secret_access_key" { default = ""}
