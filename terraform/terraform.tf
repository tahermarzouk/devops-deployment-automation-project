terraform {
 required_version = "~>1.3.4"
 required_providers {
  azurerm = {
    source = "hashicorp/azurerm"
    version = "=3.0.0"
  }
  kubernetes = {
    source = "hashicorp/kubernetes"
    version = "~>2.16.0"
  }
   helm = {
    source = "hashicorp/helm"
    version = "~>2.7.1"
  }
  tls = {
    source = "hashicorp/tls"
    version = "=4.0.4"
  }
 }

}

provider "azurerm" {
    skip_provider_registration = true
  features {}
}

