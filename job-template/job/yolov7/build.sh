#!/bin/bash

set -ex

docker build --network=host -t harbor.bigdata.com/cube-studio/yolov7:2024.01 -f Dockerfile  .
docker push harbor.bigdata.com/cube-studio/yolov7:2024.01

# docker buildx build --platform linux/amd64,linux/arm64 -t ccr.ccs.tencentyun.com/cube-studio/yolov7:2024.01 . --push
