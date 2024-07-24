# 构建应用镜像 docker build --network=host -t ccr.ccs.tencentyun.com/cube-studio/aihub:chatglm  .
FROM ccr.ccs.tencentyun.com/cube-studio/aihub:base-cuda11.8-python3.11

RUN pip install vllm Werkzeug==2.2.2 tiktoken
ENV HF_ENDPOINT https://hf-mirror.com

WORKDIR /app
COPY * /app/
