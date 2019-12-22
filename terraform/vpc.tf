# Declare the data source
data "aws_availability_zones" "available" {
  state = "available"
  # blacklisted_names = [
  #     "us-east-1e",
  #     "us-east-1f",
  #     "us-east-1d",
  #     "us-east-1c"
  # ]
}

resource "aws_vpc" "main" {
  cidr_block       = "10.0.0.0/16"
  # instance_tenancy = "dedicated"

  tags = merge(
    {
      "Name" = var.vpc_name
    },
    var.tags,
  )
}

# Create var.az_count public subnets, each in a different AZ
resource "aws_subnet" "public" {
  count             = var.az_count
  vpc_id            = aws_vpc.main.id
  availability_zone = data.aws_availability_zones.available.names[count.index]

  cidr_block = element(
    cidrsubnets(aws_vpc.main.cidr_block, 4, 4, 8, 4),
    2 + count.index,
  )

  # ipv6_cidr_block                 = cidrsubnet(aws_vpc.network.ipv6_cidr_block, 8, count.index)
  map_public_ip_on_launch = true

  # assign_ipv6_address_on_creation = true

  tags = {
    "Name" = "main-public-${count.index}"
  }
}

# Create var.az_count private subnets, each in a different AZ
resource "aws_subnet" "private" {
  count = var.az_count

  vpc_id            = aws_vpc.main.id
  availability_zone = data.aws_availability_zones.available.names[count.index]
  cidr_block = element(
    cidrsubnets(aws_vpc.main.cidr_block, 4, 4, 8, 4),
    count.index,
  )
  tags = {
    "Name" = "main-private-${count.index}"
  }
}

# IGW for the public subnet
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id

  tags = merge(
    {
      "Name" = var.vpc_name
    },
    var.tags,
  )
}

# Route the public subnet traffic through the IGW
resource "aws_route" "internet_access" {
  route_table_id         = aws_vpc.main.main_route_table_id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.gw.id
}

# Create a NAT gateway with an EIP for each private subnet to get internet connectivity
resource "aws_eip" "gw" {
  count      = var.az_count
  vpc        = true
  depends_on = [aws_internet_gateway.gw]
  tags = merge(
    {
      "Name" = "eip-${var.vpc_name}"
    },
    var.tags,
  )
}

resource "aws_nat_gateway" "gw" {
  count         = var.az_count
  subnet_id     = element(aws_subnet.public.*.id, count.index)
  allocation_id = element(aws_eip.gw.*.id, count.index)
  tags = merge(
    {
      "Name" = "nat-gw-${var.vpc_name}"
    },
    var.tags,
  )
}

# Create a new route table for the private subnets
# And make it route non-local traffic through the NAT gateway to the internet
resource "aws_route_table" "private" {
  count  = var.az_count
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = element(aws_nat_gateway.gw.*.id, count.index)
  }
  tags = merge(
    {
      "Name" = "route-table-private-${var.vpc_name}"
    },
    var.tags,
  )
}

# Explicitely associate the newly created route tables to the private subnets (so they don't default to the main route table)
resource "aws_route_table_association" "private" {
  count          = var.az_count
  subnet_id      = element(aws_subnet.private.*.id, count.index)
  route_table_id = element(aws_route_table.private.*.id, count.index)
}

### Security

# ALB Security group
# This is the group you need to edit if you want to restrict access to your application
resource "aws_security_group" "lb" {
  name        = "tf-ecs-alb"
  description = "controls access to the ALB"
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
    from_port   = 80
    to_port     = 80
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Traffic to the ECS Cluster should only come from the ALB
resource "aws_security_group" "ecs_tasks" {
  name        = "tf-ecs-tasks"
  description = "allow inbound access from the ALB only"
  vpc_id      = aws_vpc.main.id

  ingress {
     from_port       = 3306
     to_port         = 3306
     protocol        = "tcp"
     cidr_blocks = ["10.0.0.0/16"]
   }

   ingress {
     from_port       = 5432
     to_port         = 5432
     protocol        = "tcp"
     cidr_blocks = ["10.0.0.0/16"]
   }
   ingress {
     from_port       = 6379
     to_port         = 6379
     protocol        = "tcp"
     cidr_blocks = ["10.0.0.0/16"]
   }

  ingress {
    protocol    = "tcp"
    from_port   = var.backend_port
    to_port     = var.backend_port
    security_groups = [aws_security_group.lb.id]
  }
  ingress {
    protocol    = "tcp"
    from_port   = var.frontend_port
    to_port     = var.frontend_port
    security_groups = [aws_security_group.lb.id]
  }

  ingress {
    protocol        = "tcp"
    from_port       = "80"
    to_port         = "80"
    security_groups = [aws_security_group.lb.id]
  }
  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}

### ALB

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
}

resource "aws_alb_target_group" "frontend" {
  name        = "ecs-quix-frontend-alb-tg"
  port        = var.frontend_port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"
  tags = merge(
    {
      "Name" = "alb-tg-${var.vpc_name}"
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
      "Name" = "alb-tg-${var.vpc_name}"
    },
    var.tags,
  )
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

#
# resource "aws_security_group_rule" "ecs_tasks-in-http" {
# 	type="ingress"
# 	from_port=80
# 	to_port=80
# 	protocol="tcp"
# 	security_group_id="${aws_security_group.ecs_tasks.id}"
# 	source_security_group_id="${aws_security_group.production-access.id}"
# }
# resource "aws_security_group_rule" "ecs_tasks-eggress" {
# 	type="egress"
# 	from_port=0
# 	to_port=0
# 	protocol="-1"
# 	security_group_id="${aws_security_group.ecs_tasks.id}"
# 	cidr_blocks=["0.0.0.0/0"]
# }
# Network Load Balancer for apiservers and ingress
# resource "aws_lb" "nlb" {
#   name               = "main-nlb"
#   load_balancer_type = "network"
#   internal           = false
#   subnets = aws_subnet.public.*.id
#   enable_cross_zone_load_balancing = true
# }
# Forward HTTP ingress traffic to workers
# resource "aws_lb_listener" "ingress-http" {
#   load_balancer_arn = aws_lb.nlb.arn
#   protocol          = "TCP"
#   port              = 80
#
#   default_action {
#     type             = "forward"
#     target_group_arn = module.workers.target_group_http
#   }
# }
#
# resource "aws_network_interface" "eni" {
#   subnet_id       = "${aws_subnet.public_a.id}"
#   private_ips     = ["10.0.0.50"]
#   security_groups = ["${aws_security_group.web.id}"]
#
#   attachment {
#     instance     = "${aws_instance.test.id}"
#     device_index = 1
#   }
# }
