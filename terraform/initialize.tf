/*
    Initialize the remote state with these values.
    Only need to run this once via terraform init.
*/

terraform {
  backend "s3" {
    bucket = "terraform-state.quix-oss"
    key    = "quix.tfstate"
    region = "us-east-1"
    encrypt = "true"
    profile = "quix"
    // no lock we are creating dynamodb tables for locking in this global config
    // we are only run this rarely so skip locking
    dynamodb_table = "terraform-lock"

  }
}
