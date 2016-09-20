#!/bin/bash



if [ $ENV -a $ENV = "prod" ]; then
	yes | cp -rf docker/prod/Dockerfile Dockerfile
	yes | cp -rf docker/prod/docker-compose.yml docker-compose.yml
	yes | cp -rf docker/prod/default.conf default.conf
	sudo docker-compose build
	sudo docker-compose up -d
else
	yes | cp -rf docker/dev/Dockerfile Dockerfile
	yes | cp -rf docker/dev/docker-compose.yml docker-compose.yml
	sudo docker-compose build
	sudo docker-compose up -d
fi