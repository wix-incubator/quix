/*
Creates an Amazon RDS DB instance.
*/
resource "aws_db_subnet_group" "quix-rds-group" {
  name        = "subnet_group"
  description = "subnet group for RDS"
  # subnet_ids  = ["${element(aws_subnet.private.ids, 0)}", "${element(aws_subnet.private.ids, 1)}"]
  subnet_ids = aws_subnet.private.*.id
}

resource "random_password" "password" {
  length           = 16
  special          = true
  override_special = "_%@"
}

resource "aws_db_instance" "quix-rds" {
  allocated_storage          = 20
  storage_type               = "gp2"
  engine                     = "mysql"
  engine_version             = "5.7.22"
  instance_class             = "db.t2.micro"
  name                       = "quix"
  username                   = "quix"
  password                   = random_password.password.result
  auto_minor_version_upgrade = false
  storage_encrypted          = false
  apply_immediately          = true

  vpc_security_group_ids = ["${aws_security_group.ecs_tasks.id}"]
  db_subnet_group_name   = aws_db_subnet_group.quix-rds-group.id
  skip_final_snapshot    = true
  tags = merge(
    {
      "Name" = "quix-rds"
    },
    var.tags,
  )
}
