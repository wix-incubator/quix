/*
Specifies AWS security groups
*/

// Security group for ALB
resource "aws_security_group" "lb" {
  name        = "ecs-alb-main"
  description = "controls access to the ALB Main"
  vpc_id      = aws_vpc.main.id
  ingress {
    protocol    = "tcp"
    from_port   = var.backend_port
    to_port     = var.backend_port
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    protocol    = "tcp"
    from_port   = var.frontend_port
    to_port     = var.frontend_port
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    protocol    = "tcp"
    from_port   = var.presto_port
    to_port     = var.presto_port
    cidr_blocks = ["10.0.0.0/8"]
  }
  ingress {
    protocol    = "tcp"
    from_port   = 80
    to_port     = 80
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    protocol    = "tcp"
    from_port   = 443
    to_port     = 443
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    protocol    = "tcp"
    from_port   = var.backend_public_port
    to_port     = var.backend_public_port
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  # lifecycle {
  #     create_before_destroy = true
  # }
}

// Security group for ALB Presto
resource "aws_security_group" "presto_lb" {
  name        = "ecs-alb-presto"
  description = "controls access to the ALB Presto"
  vpc_id      = aws_vpc.main.id
  ingress {
    protocol        = "tcp"
    from_port       = var.presto_port
    to_port         = var.presto_port
    cidr_blocks     = ["10.0.0.0/8"]
    security_groups = [aws_security_group.ecs_tasks.id]

  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  # lifecycle {
  #     create_before_destroy = true
  # }

}


// Traffic to the ECS Cluster should only come from the ALB
resource "aws_security_group" "ecs_tasks" {
  name        = "tf-ecs-tasks"
  description = "allow inbound access from the ALB only"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
  }

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
  }
  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
  }

  ingress {
    protocol    = "tcp"
    from_port   = var.backend_port
    to_port     = var.backend_port
    cidr_blocks = ["10.0.0.0/8"]

    # security_groups = [aws_security_group.lb.id]
  }

  ingress {
    protocol    = "tcp"
    from_port   = var.presto_port
    to_port     = var.presto_port
    cidr_blocks = ["10.0.0.0/8"]

    # security_groups = [aws_security_group.lb.id]
  }
  ingress {
    protocol    = "tcp"
    from_port   = var.frontend_port
    to_port     = var.frontend_port
    cidr_blocks = ["10.0.0.0/8"]

    # security_groups = [aws_security_group.lb.id]
  }

  ingress {
    protocol    = "tcp"
    from_port   = "80"
    to_port     = "80"
    cidr_blocks = ["10.0.0.0/8"]

    # security_groups = [aws_security_group.lb.id]
  }
  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
  # lifecycle {
  #     create_before_destroy = true
  # }

}
