#!/bin/bash

set -ex

docker build --network=host -t harbor.bigdata.com/cube-studio/vllm-server:20240725 -f Dockerfile .
docker push harbor.bigdata.com/cube-studio/vllm-server:20240725