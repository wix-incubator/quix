resource "aws_ssm_parameter" "dbhost" {
  name  = "quix-rds-host"
  type  = "String"
  value = aws_db_instance.quix-rds.address

  tags = merge(
    {
      "Name" = "${var.vpc_name}-dbhost"
    },
    var.tags,
  )
}

resource "aws_ssm_parameter" "dbuser" {
  name  = "quix-rds-user"
  type  = "String"
  value = aws_db_instance.quix-rds.username
  tags = merge(
    {
      "Name" = "${var.vpc_name}-dbuser"
    },
    var.tags,
  )
}

resource "aws_ssm_parameter" "dbpwd" {
  name  = "quix-rds-password"
  type  = "SecureString"
  value = aws_db_instance.quix-rds.password
  tags = merge(
    {
      "Name" = "${var.vpc_name}-dbpwd"
    },
    var.tags,
  )
}

resource "aws_ssm_parameter" "dbname" {
    name  = "quix-rds-name"
  type  = "String"
  value = aws_db_instance.quix-rds.name

  tags = merge(
    {
      "Name" = "${var.vpc_name}-dbname"
    },
    var.tags,
  )
}

resource "aws_ssm_parameter" "dbport" {
    name  = "quix-rds-port"
  type  = "String"
  value = aws_db_instance.quix-rds.port

  tags = merge(
    {
      "Name" = "${var.vpc_name}-dbport"
    },
    var.tags,
  )
}


resource "aws_ssm_parameter" "google_sso_client_id" {
  name  = "google_sso_client_id"
  type  = "String"
  value = "google_sso_client_id"
  tags = merge(
    {
      "Name" = "${var.vpc_name}-sso_id"
    },
    var.tags,
  )

  lifecycle {
      ignore_changes = [
        # Ignore changes to value, e.g. because updated manually
        value,
      ]
    }
  overwrite  = false
}

resource "aws_ssm_parameter" "google_sso_client_secret" {
  name  = "google_sso_client_secret"
  type  = "String"
  value = "google_sso_client_secret"
  overwrite  = false
  tags = merge(
    {
      "Name" = "${var.vpc_name}-sso_sec"
    },
    var.tags,
  )
  lifecycle {
      ignore_changes = [
        # Ignore changes to value, e.g. because updated manually
        value,
      ]
    }
}

resource "aws_ssm_parameter" "auth_secret" {
  name  = "auth_secret"
  type  = "String"
  value = "somekeygoeshere"
  overwrite  = false
  tags = merge(
    {
      "Name" = "${var.vpc_name}-auth_secret"
    },
    var.tags,
  )
  lifecycle {
      ignore_changes = [
        # Ignore changes to value, e.g. because updated manually
        value,
      ]
    }
}
