
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

resource "aws_ecs_task_definition" "quix" {
  family                   = "quix"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.fargate_cpu * 4
  memory                   = var.fargate_memory * 4*2
  execution_role_arn       = aws_iam_role.ecs_task_role.arn
  container_definitions = <<DEFINITION
[
  {
    "essential": false,
    "cpu": ${var.fargate_cpu * 2},
    "image": "${var.quix_backend_image}",
    "memory": ${var.fargate_memory * 2},
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
},
{

  "essential": false,
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
  "ulimits": [
    {
      "name": "nofile",
      "hardLimit": 65536,
      "softLimit": 65536
    },
    {
      "name": "nproc",
      "hardLimit": 2048,
      "softLimit": 2048
    },
    {
      "name": "memlock",
      "hardLimit": -1,
      "softLimit": -1
    }
  ],
  "portMappings": [
    {
      "containerPort": ${var.presto_port},
      "hostPort": ${var.presto_port}
    }
  ]
},
{
  "essential": true,
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
          "value": "http://${aws_alb.presto.dns_name}:${var.presto_port}/v1"
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

resource "aws_ecs_service" "quix" {
  name            = "ecs-service-quix"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.quix.arn
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
  load_balancer {
    target_group_arn = aws_alb_target_group.backend.id
    container_name   = "quix-backend"
    container_port   = var.backend_port
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.presto.id
    container_name   = "presto"
    container_port   = var.presto_port
  }
  depends_on = [
      aws_alb_listener.frontend,
      aws_alb_listener.backend,
      aws_alb_listener.presto
  ]
}
