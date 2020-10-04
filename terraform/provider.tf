provider "aws" {
  version = "~> 2.0"
  region  = "us-east-1"
  profile = "quix"
}

provider "acme" {
  server_url = "https://acme-v02.api.letsencrypt.org/directory"
}
