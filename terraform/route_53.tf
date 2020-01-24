# ------------------------------------------
#  AWS ROUTE53 : Domain creation
# ------------------------------------------

# This assumes that you have already setup AWS as your DNS provider, and
# created a hosted zone again the main domain, e.g against example.com.
# This datasource simply looks up the zone details to use in the creation
# of the additional sub domain records.

resource "aws_route53_zone" "quix" {
  # count              = var.enable_ssl ? 1: 0
  name         = var.dns_domain_name
  tags = merge(
    {
      "Name" = "quix-zone"
    },
    var.tags,
  )
}

resource "aws_route53_record" "at-quix" {
   # count              = var.enable_ssl ? 1: 0
   zone_id = aws_route53_zone.quix.zone_id
   name    = "@"
   type    = "CNAME"
   ttl     = "60"
   records = ["${aws_alb.main.dns_name}"]
   allow_overwrite = "true"
}

resource "aws_route53_record" "star-quix" {
   # count              = var.enable_ssl ? 1: 0
   zone_id = aws_route53_zone.quix.zone_id
   name    = "*"
   type    = "CNAME"
   ttl     = "60"
   records = ["${aws_alb.main.dns_name}"]
   allow_overwrite = "true"
}
resource "aws_route53_record" "www-quix" {
   # count              = var.enable_ssl ? 1: 0
   zone_id = aws_route53_zone.quix.zone_id
   name    = "www"
   type    = "CNAME"
   ttl     = "60"
   records = ["${aws_alb.main.dns_name}"]
   allow_overwrite = "true"

}

resource "aws_route53_record" "cert_validation" {
  count                   = var.enable_ssl ? 1: 0
  name    = aws_acm_certificate.cert[0].domain_validation_options.0.resource_record_name
  type    = aws_acm_certificate.cert[0].domain_validation_options.0.resource_record_type
  zone_id = aws_route53_zone.quix.id
  records = ["${aws_acm_certificate.cert[0].domain_validation_options.0.resource_record_value}"]
  ttl     = 60
}
