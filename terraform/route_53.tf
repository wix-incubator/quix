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

resource "aws_route53_record" "quix-letsencrypt" {
   # count              = var.enable_ssl ? 1: 0
   zone_id = aws_route53_zone.quix.zone_id
   name    = "www"
   type    = "CNAME"
   ttl     = "60"
   records = ["${aws_alb.main.dns_name}"]
}
