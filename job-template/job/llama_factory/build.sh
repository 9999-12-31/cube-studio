#!/bin/bash

set -ex

docker build --network=host -t harbor.bigdata.com/cube-studio/llama-factory:20240723 -f Dockerfile .
docker push harbor.bigdata.com/cube-studio/llama-factory:20240723