provider "aws" {
  version = "~> 2.0"
  region  = "us-east-1"
  profile = "quix"
}

provider "acme" {
  server_url = "https://acme-v02.api.letsencrypt.org/directory"
}

# provider "google" {
#   credentials = file("~/quix-oss-gcp.json")
#   project     = "quix-oss"
#   region  = "us-central1"
#   zone    = "us-central1-c"
# }
