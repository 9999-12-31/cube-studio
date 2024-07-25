#FROM ccr.ccs.tencentyun.com/cube-studio/aihub:base-cuda11.8-python3.11
FROM harbor.bigdata.com/cube-studio/ubuntu-gpu:cuda11.8.0-cudnn8-python3.9

RUN pip install vllm --index-url https://mirrors.aliyun.com/pypi/simple
ENV HF_ENDPOINT https://hf-mirror.com

WORKDIR /app
COPY * /app/


