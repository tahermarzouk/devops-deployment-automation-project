resource "helm_release" "datadog" {
  name       = "datadog"
  chart      = "datadog"
  repository = "https://helm.datadoghq.com"
  version    = "2.10.1"
  namespace  = "datadog"
  create_namespace = true
  reset_values = true
  
  
  set {
    name  = "datadog.apiKey"
    value = "55dbb614a7b899fa18b440c459b5f9cc"
  }

  set {
    name  = "datadog.logs.enabled"
    value = true
  }

  set {
    name  = "datadog.logs.containerCollectAll"
    value = true
  }

  set {
    name  = "datadog.site"
    value = "datadoghq.com"
  }

  set {
    name  = "datadog.kubelet.tlsVerify"
    value = false
  }  

}


