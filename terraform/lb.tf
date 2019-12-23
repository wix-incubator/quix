### ALB MAIN
resource "aws_alb" "main" {
  name            = "ecs-quix-alb"
  subnets         = aws_subnet.public.*.id
  security_groups = [aws_security_group.lb.id]
  tags = merge(
    {
      "Name" = "alb-${var.vpc_name}"
    },
    var.tags,
  )
  # depends_on = [aws_security_group.lb]

}

### ALB PRESTO
resource "aws_alb" "presto" {
  name            = "ecs-quix-presto-alb"
  subnets         = aws_subnet.private.*.id
  security_groups = [aws_security_group.presto_lb.id]
  internal = true
  tags = merge(
    {
      "Name" = "alb-presto-${var.vpc_name}"
    },
    var.tags,
  )
  # depends_on = [aws_security_group.presto_lb]
}

resource "aws_alb_target_group" "presto" {
  name        = "ecs-quix-presto-alb-tg"
  port        = var.presto_port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"
  tags = merge(
    {
      "Name" = "alb-tg-presto-${var.vpc_name}"
    },
    var.tags,
  )
  health_check {
   healthy_threshold   = 2
   unhealthy_threshold = 5
   timeout             = "5"
   port                = var.presto_port
   path                = "/"
   protocol            = "HTTP"
   interval            = 10
   matcher             = "200-499"
 }
}

resource "aws_alb_listener" "presto" {
  load_balancer_arn = aws_alb.presto.id
  port              = var.presto_port
  protocol          = "HTTP"

  default_action {
    target_group_arn = aws_alb_target_group.presto.id
    type             = "forward"
  }
}

resource "aws_alb_target_group" "frontend" {
  name        = "ecs-quix-frontend-alb-tg"
  port        = var.frontend_port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"
  tags = merge(
    {
      "Name" = "alb-tg-frontend-${var.vpc_name}"
    },
    var.tags,
  )
}

resource "aws_alb_listener" "frontend" {
  load_balancer_arn = aws_alb.main.id
  port              = var.frontend_port
  protocol          = "HTTP"

  default_action {
    target_group_arn = aws_alb_target_group.frontend.id
    type             = "forward"
  }
}


resource "aws_alb_target_group" "backend" {
  name        = "ecs-quix-backend-alb-tg"
  port        = var.backend_port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"
  tags = merge(
    {
      "Name" = "alb-tg-backend-${var.vpc_name}"
    },
    var.tags,
  )
  health_check {
   healthy_threshold   = 2
   unhealthy_threshold = 10
   timeout             = "5"
   port                = var.backend_port
   path                = "/health/keep_alive"
   protocol            = "HTTP"
   interval            = 10
   matcher             = "200-499"
 }
}

resource "aws_alb_listener" "frontend_http" {
  load_balancer_arn = aws_alb.main.id
  port              = 80
  protocol          = "HTTP"

  default_action {
    target_group_arn = aws_alb_target_group.frontend.id
    type             = "forward"
  }
}

resource "aws_alb_listener" "backend" {
  load_balancer_arn = aws_alb.main.id
  port              = var.backend_port
  protocol          = "HTTP"

  default_action {
    target_group_arn = aws_alb_target_group.backend.id
    type             = "forward"
  }
}
