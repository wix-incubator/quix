
resource "aws_ecs_cluster" "main" {
  name = "quix-ecs-cluster"
  tags = merge(
    {
      "Name" = "alb-tg-${var.vpc_name}"
    },
    var.tags,
  )
}

resource "aws_cloudwatch_log_group" "quix-logs" {
  name = "quix-logs"
  retention_in_days = "14"
}

resource "aws_ecs_task_definition" "backend" {
  family                   = "quix-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.fargate_cpu
  memory                   = var.fargate_memory
  execution_role_arn       = aws_iam_role.ecs_task_role.arn
  container_definitions = <<DEFINITION
[
  {
    "cpu": ${var.fargate_cpu},
    "image": "${var.quix_backend_image}",
    "memory": ${var.fargate_memory},
    "name": "quix-backend",
    "networkMode": "awsvpc",
    "portMappings": [
      {
        "containerPort": ${var.backend_port},
        "hostPort": ${var.backend_port}
      }
    ],
    "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
            "awslogs-group": "${aws_cloudwatch_log_group.quix-logs.name}",
            "awslogs-region": "${var.aws_region}",
            "awslogs-stream-prefix": "backend"
        }
    },
    "environment": [
        {
           "name": "MODULES",
           "value": "presto"
        },
        {
            "name": "MODULES_PRESTO_API",
            "value": "http://presto:${var.presto_port}/v1"
         },
        {
         "name": "MODULES_PRESTO_CATALOG",
         "value": "system"
        },
        {
          "name": "MODULES_PRESTO_SCHEMA",
          "value": "runtime"
        },
        {
           "name": "MODULES_PRESTO_SOURCE",
           "value": "quix"
       },

       {
         "name": "DB_NAME",
         "value": "${aws_ssm_parameter.dbname.value}"
       },
       {
         "name": "DB_USER",
         "value": "${aws_ssm_parameter.dbuser.value}"
       },
       {
         "name": "DB_PASS",
         "value": "${aws_ssm_parameter.dbpwd.value}"
       },
       {
         "name": "DB_HOST",
         "value": "${aws_ssm_parameter.dbhost.value}"
       }
    ]
  }
]
DEFINITION

}

resource "aws_ecs_task_definition" "frontend" {
  family                   = "quix-frontend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.fargate_cpu
  memory                   = var.fargate_memory
  execution_role_arn       = aws_iam_role.ecs_task_role.arn
  container_definitions = <<DEFINITION
[
  {
    "cpu": ${var.fargate_cpu},
    "image": "${var.quix_frontend_image}",
    "memory": ${var.fargate_memory},
    "name": "quix-frontend",
    "networkMode": "awsvpc",
    "portMappings": [
      {
        "containerPort": ${var.frontend_port},
        "hostPort": ${var.frontend_port}
      }
    ],
    "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
            "awslogs-group": "${aws_cloudwatch_log_group.quix-logs.name}",
            "awslogs-region": "${var.aws_region}",
            "awslogs-stream-prefix": "frontend"
        }
    },
    "environment": [
        {
           "name": "MODULES",
           "value": "presto"
        },
        {
            "name": "MODULES_PRESTO_API",
            "value": "http://presto:${var.presto_port}/v1"
         },
        {
         "name": "MODULES_PRESTO_CATALOG",
         "value": "system"
        },
        {
          "name": "MODULES_PRESTO_SCHEMA",
          "value": "runtime"
        },
        {
           "name": "MODULES_PRESTO_SOURCE",
           "value": "quix"
        },
        {
         "name": "DB_NAME",
         "value": "${aws_ssm_parameter.dbname.value}"
        },
        {
         "name": "DB_USER",
         "value": "${aws_ssm_parameter.dbuser.value}"
        },
        {
         "name": "DB_PASS",
         "value": "${aws_ssm_parameter.dbpwd.value}"
        },
        {
         "name": "DB_HOST",
         "value": "${aws_ssm_parameter.dbhost.value}"
        }
    ]
  }
]
DEFINITION
}

resource "aws_ecs_task_definition" "presto" {
  family                   = "presto"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.fargate_cpu
  memory                   = var.fargate_memory
  # volume {
  #   name = "data"
  #   host_path = "/var/elasticsearch/data"
  # }
  execution_role_arn       = aws_iam_role.ecs_task_role.arn
  container_definitions = <<DEFINITION
[
  {
    "cpu": ${var.fargate_cpu},
    "image": "${var.presto_image}",
    "memory": ${var.fargate_memory},
    "name": "presto",
    "networkMode": "awsvpc",
    "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
            "awslogs-group": "${aws_cloudwatch_log_group.quix-logs.name}",
            "awslogs-region": "${var.aws_region}",
            "awslogs-stream-prefix": "presto"
        }
    },
    "portMappings": [
      {
        "containerPort": ${var.presto_port},
        "hostPort": ${var.presto_port}
      }
    ]
  }
]
DEFINITION
}

resource "aws_ecs_service" "frontend" {
  name            = "ecs-service-frontend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = "1"
  launch_type     = "FARGATE"

  network_configuration {
    security_groups = [aws_security_group.ecs_tasks.id]
    subnets         = aws_subnet.private.*.id
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.frontend.id
    container_name   = "quix-frontend"
    container_port   = var.frontend_port
  }
  depends_on = [aws_alb_listener.frontend]
}

resource "aws_ecs_service" "backend" {
  name            = "ecs-service-backend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = "1"
  launch_type     = "FARGATE"

  network_configuration {
    security_groups = [aws_security_group.ecs_tasks.id]
    subnets         = aws_subnet.private.*.id
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.backend.id
    container_name   = "quix-backend"
    container_port   = var.backend_port
  }
  depends_on = [aws_alb_listener.backend]
}
resource "aws_ecs_service" "presto" {
  name            = "ecs-service-presto"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.presto.arn
  desired_count   = "1"
  launch_type     = "FARGATE"

  network_configuration {
    security_groups = [aws_security_group.ecs_tasks.id]
    subnets         = aws_subnet.private.*.id
  }

  # load_balancer {
  #   target_group_arn = aws_alb_target_group.presto.id
  #   container_name   = "presto"
  #   container_port   = var.presto_port
  # }
  # depends_on = [aws_alb_listener.frontend]
}
