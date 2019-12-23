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
