#!/bin/bash

docker build -t hashwatch-webui .
docker run -p 5173:5173 -d --name hashwatch-webui --restart unless-stopped hashwatch-webui
