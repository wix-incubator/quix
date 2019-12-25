output "vpc-id" {
  value = aws_vpc.main.id
}

output "account_id" {
  value = data.aws_caller_identity.current.account_id
}

output "caller_arn" {
  value = data.aws_caller_identity.current.arn
}

output "caller_user" {
  value = data.aws_caller_identity.current.user_id
}

output "quix_alb" {
  value = aws_alb.main.dns_name
}

output "presto_alb_url" {
  value = "http://${aws_alb.presto.dns_name}:${var.presto_port}/v1"
}
