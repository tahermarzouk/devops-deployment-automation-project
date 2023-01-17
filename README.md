# DevOps Project 

## Architecture 

arch
![arch](https://user-images.githubusercontent.com/61206375/212776152-d196bcf5-d335-4ddf-bb86-f19b3758f0a5.jpg)


* I used for front-end React, for backend I used Node.Js
and I used Postgres to store the data in the database.

## Observability

### 1.Metrics 

* I implemented a metrics that me to track how many request are processing with status=200 if I had enter a number else with status=400 ( number_of_inputs )
* I used prometheus to collect and visualize them 

2
![2](https://user-images.githubusercontent.com/61206375/212776042-c55fed1a-7dc7-424a-b6a3-69fd34bcf540.jpg)


3
![3](https://user-images.githubusercontent.com/61206375/212776190-902ea9b0-5aa1-4482-8681-02abcc6034b5.jpg)


### 2.Logs
* I implemented logger that have the attributes request_id that uniquely identifies the request and client_ip which is the ip address of
the caller
* I used datadog to collect and visualize them

4 
![4](https://user-images.githubusercontent.com/61206375/212776226-e82ac5a7-6103-4f68-9358-dabfdd245d9e.jpg)


* I implemented a custom logger with timestamp

5 
![5](https://user-images.githubusercontent.com/61206375/212776232-b4dba0d3-9440-40a1-85be-196a5a1781f8.jpg)

### 3.Traces 

* I Generated traces for my handlers with the attributes request_id and client_ip 

## Automation

### Infrastructure provisionning

* I used Terraform to provision Resource group, Kubernetes cluster, Datadog, Argocd, Prometheus, Ingress   
* when provisionning datadog I enter the value of the api_key 
* I had the password for argocd by running this command 
```
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
```
## Deployment 

I built the application using Docker and kubernetes for deployment 

7
![7](https://user-images.githubusercontent.com/61206375/212776307-c1c893ee-3c7b-4115-94dd-48b06358d565.jpg) 

* I created the secret to set the password of postgres by running this command 
```
kubectl create secret generic pgpassword --from-literal PGPASSWORD=<PASSWORD> 
```
### Deployment using Argo CD

* Argo CD pulls the chart from this github repo. The default values in the chart can be overriden using ArgoCD

6 
![6](https://user-images.githubusercontent.com/61206375/212776239-f02e68bb-b93e-4b40-ad3a-2f3d5fb1e670.jpg)





