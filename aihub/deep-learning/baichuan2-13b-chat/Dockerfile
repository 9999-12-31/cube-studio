
# 构建应用镜像 docker build --network=host -t ccr.ccs.tencentyun.com/cube-studio/modelscope:chatyuan-large-v2  .
FROM ccr.ccs.tencentyun.com/cube-studio/modelscope:base-cuda11.3-python3.7
# 安装基础环境
WORKDIR /
ENV PATH /opt/conda/envs/python39/bin/python:$PATH
COPY init.sh /init.sh
COPY * /app/

RUN bash /init.sh
# 安装文件
WORKDIR /app
#ENTRYPOINT ["python", "app.py"]
