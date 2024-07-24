#FROM ccr.ccs.tencentyun.com/cube-studio/aihub:base-cuda11.8-python3.11
FROM harbor.bigdata.com/cube-studio/ubuntu-gpu:cuda11.8.0-cudnn8-python3.9

#设置工作目录
WORKDIR /FastChat/ChatGLM-Finetuning

# 从git上克隆llama-factory仓库
RUN git clone https://github.com/liucongg/ChatGLM-Finetuning.git /FastChat/ChatGLM-Finetuning

# 复制安装依赖的脚本到 Docker 内
COPY install_dependencies.sh .

# 运行安装依赖的脚本
RUN chmod +x install_dependencies.sh && ./install_dependencies.sh

ENV HF_ENDPOINT https://hf-mirror.com
ENV HF_HUB_ENABLE_HF_TRANSFER=1

RUN apt update && apt install -y aria2 git-lfs wget
RUN wget https://hf-mirror.com/hfd/hfd.sh && chmod a+x hfd.sh
RUN pip3 install -U huggingface_hub hf_transfer

COPY * /FastChat/ChatGLM-Finetuning
#ENTRYPOINT ["python","start.py"]

