data "aws_caller_identity" "current" {}

# TERRAFORM STATE Bucket
resource "aws_s3_bucket" "terraform_state" {
  bucket = "terraform-state.quix-oss"
  acl    = "private"

  versioning {
      enabled = true
  }
  lifecycle{
      prevent_destroy = true
  }
  tags = merge(
    {
     Name = "TerraformStateBucket",
     Description = "Terraform state locking table for account ${data.aws_caller_identity.current.account_id}."
    },
    var.tags,
  )
}


# ---------------------------------
# Dynamodb tables for locking state
# ---------------------------------

resource "aws_dynamodb_table" "tf_backend_state_lock_table" {
  # count = true
  name           = var.tf_dynamodb_lock_table_name
  read_capacity  = var.tf_lock_table_read_capacity
  write_capacity = var.tf_lock_table_write_capacity
  hash_key       = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = merge(
    {
     Description = "Terraform state locking table for account ${data.aws_caller_identity.current.account_id}."
    },
    var.tags,
  )
  lifecycle {
    prevent_destroy = true
  }
}
