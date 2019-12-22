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
