# ----------------------------------------------------------------
# Inputs required to do an initial registration (aka create an
# account) with the ACME provider (Let's Encrypt)
# ----------------------------------------------------------------



# Create an on the fly private key for the registration
# (not the certificate). Could simply be imported as well
resource "tls_private_key" "acme_registration_private_key" {
  count              = var.enable_acme_ssl ? 1: 0
  algorithm          = "RSA"
}

# Set up a registration using the registration private key
resource "acme_registration" "reg" {
  count              = var.enable_acme_ssl ? 1: 0
  account_key_pem    = tls_private_key.acme_registration_private_key[0].private_key_pem
  email_address      = var.acme_registration_email
  lifecycle {
    create_before_destroy = true
  }
}

# ----------------------------------------------------------------
# Inputs required to request a new cert from ACME provider
# ----------------------------------------------------------------

# Create a certificate
resource "acme_certificate" "certificate" {
   count                        = var.enable_acme_ssl ? 1: 0
   account_key_pem              = tls_private_key.acme_registration_private_key[0].private_key_pem
   common_name                  = var.acme_certificate_common_name
   subject_alternative_names    = [var.dns_domain_name]
   min_days_remaining           = var.min_days_remaining
   recursive_nameservers        = ["8.8.8.8:53"]

   dns_challenge {
    provider = "route53"

    # Without this explicit config, the ACME provider (which uses lego
    # under the covers) will look for environment variables to use.
    # These environment variable names happen to overlap with the names
    # also required by the native Terraform AWS provider, however is not
    # guaranteed. You may want to explicitly configure them here if you
    # would like to use different credentials to those used by the main
    # Terraform provider
    config = {
        AWS_REGION              = var.aws_region
        AWS_PROFILE             = var.aws_acme_profile
        AWS_HOSTED_ZONE_ID      = aws_route53_zone.quix.zone_id
        AWS_TTL                 = 60
        AWS_PROPAGATION_TIMEOUT = 120
    }
  }
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate" "cert" {
  count                   = var.enable_ssl ? 1: 0

  domain_name       =  var.dns_domain_name
  subject_alternative_names = ["*.${var.dns_domain_name}"]

  validation_method = "DNS"

  tags = merge(
    {
      "Name" = "quix-zone"
    },
    var.tags,
  )

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "cert" {
  count              = var.enable_ssl ? 1: 0

  certificate_arn         = aws_acm_certificate.cert[0].arn
  validation_record_fqdns = ["${aws_route53_record.cert_validation[0].fqdn}"]
}


resource "aws_iam_server_certificate" "alb_cert" {
  count              = var.enable_acme_ssl ? 1: 0
  name               = "wild-quix-${formatdate("YY-MM-DD",timestamp())}"
  certificate_body   = acme_certificate.certificate[0].certificate_pem
  certificate_chain  = acme_certificate.certificate[0].issuer_pem
  private_key        = acme_certificate.certificate[0].private_key_pem

  lifecycle {
    create_before_destroy = true
    ignore_changes = [
      # Ignore changes to name, e.g. because it's calculating at execution
      name
    ]

  }
}
