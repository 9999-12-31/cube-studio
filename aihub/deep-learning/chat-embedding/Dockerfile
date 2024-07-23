# 构建应用镜像 docker build --network=host -t ccr.ccs.tencentyun.com/cube-studio/aihub:chat-private-knowledge  .
FROM ccr.ccs.tencentyun.com/cube-studio/modelscope:base-cuda11.3-python3.7
# 安装基础环境
ENV discovery.type single-node
WORKDIR /
COPY init.sh /init.sh
RUN bash /init.sh
# 安装文件
WORKDIR /app
COPY * /app/
#ENTRYPOINT ["python", "app.py"]